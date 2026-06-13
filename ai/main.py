from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Cafe AI Service")

# Expose API for access from frontend (Next.js/React) or backend proxies
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    currentRevenue: float
    prevRevenue: float
    revenueGrowth: float
    topProducts: List[Dict[str, Any]]
    categoryContributions: List[Dict[str, Any]]
    topTables: List[Dict[str, Any]]
    peakHours: List[Dict[str, Any]]
    productDrops: List[Dict[str, Any]]
    period: Optional[str] = "Last 7 Days (vs Prior 7 Days)"

@app.post("/analyze")
async def analyze_cafe(req: AnalyzeRequest):
    # Format prompt defensively against None values
    top_products_str = "\n".join([f"  * {p.get('name')}: {p.get('qty', 0) or 0} sold, ${p.get('revenue', 0.0) or 0.0:.2f} revenue" for p in req.topProducts])
    cat_contrib_str = "\n".join([f"  * {c.get('name')}: ${c.get('revenue', 0.0) or 0.0:.2f} ({c.get('percentage', 0.0) or 0.0}%)" for c in req.categoryContributions])
    top_tables_str = "\n".join([f"  * {t.get('name')}: ${t.get('revenue', 0.0) or 0.0:.2f}" for t in req.topTables])
    peak_hours_str = "\n".join([f"  * {(h.get('hour') or 0)}:00 - {(h.get('hour') or 0)+1}:00 ({h.get('count', 0) or 0} orders)" for h in req.peakHours])
    drops_str = "\n".join([f"  * {d.get('name')}: -{d.get('dropPercentage', 0.0) or 0.0}% drop (from {d.get('prevQty', 0) or 0} to {d.get('currQty', 0) or 0})" for d in req.productDrops])

    # Add diagnostic logging
    print("="*60)
    print(f"[AI Service] Incoming POST /analyze request:")
    print(f"  * Period: {req.period}")
    print(f"  * Current Revenue: ${req.currentRevenue:.2f}")
    print(f"  * Prev Revenue: ${req.prevRevenue:.2f}")
    print(f"  * Growth: {req.revenueGrowth:.1f}%")
    print(f"  * Top Products Count: {len(req.topProducts)}")
    print(f"  * Category Contributions Count: {len(req.categoryContributions)}")
    print(f"  * Top Tables Count: {len(req.topTables)}")
    print(f"  * Peak Hours Count: {len(req.peakHours)}")
    print(f"  * Drops Count: {len(req.productDrops)}")
    
    prompt = f"""Analyze the following sales performance data for "Cafe POS" and provide 5-6 concise, actionable, bulleted insights and recommendations for the cafe owner.

Data Summary:
- Period: {req.period}
- Current Week Revenue: ${req.currentRevenue:.2f} ({"+" if req.revenueGrowth >= 0 else ""}{req.revenueGrowth:.1f}% growth)
- Top Products:
{top_products_str}
- Category Contributions:
{cat_contrib_str}
- Top Tables:
{top_tables_str}
- Peak Hours:
{peak_hours_str}
- Significant Drops in Sales Qty:
{drops_str}

Formatting Constraints:
- Return exactly 5-6 bullet points.
- Do not add any greeting, intro, or concluding remarks.
- Provide direct insights first (e.g. "Revenue increased X%", "Y contributes Z% of sales").
- Conclude with a solid recommendation based on the data."""

    print("\n[AI Service] Generated prompt for LLM:")
    print(prompt)
    print("="*60)

    local_llm_url = os.getenv("LOCAL_LLM_URL")
    local_llm_model = os.getenv("LOCAL_LLM_MODEL", "lm-studio-model")
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    # 1. Try local LLM (e.g., LM Studio) first if URL is configured
    if local_llm_url:
        try:
            base_url = local_llm_url.rstrip('/')
            url = f"{base_url}/chat/completions"
            headers = {"Content-Type": "application/json"}
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json={
                    "model": local_llm_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.5
                }, timeout=60.0)
                
                if response.status_code == 200:
                    res_json = response.json()
                    text = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if text:
                        insights = [
                            line.strip() 
                            for line in text.split("\n") 
                            if line.strip().startswith(("*", "-", "•", "1", "2", "3", "4", "5", "6", "7", "8", "9"))
                        ]
                        if insights:
                            return {"source": f"local-llm ({local_llm_model})", "insights": insights}
        except Exception as e:
            print(f"Local LLM (LM Studio) API error: {e}")

    # 2. Try Gemini Cloud API
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json={
                    "contents": [{"parts": [{"text": prompt}]}]
                }, timeout=30.0)
                
                if response.status_code == 200:
                    res_json = response.json()
                    text = res_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if text:
                        insights = [
                            line.strip() 
                            for line in text.split("\n") 
                            if line.strip().startswith(("*", "-", "•", "1", "2", "3", "4", "5", "6", "7", "8", "9"))
                        ]
                        if insights:
                            return {"source": "gemini", "insights": insights}
        except Exception as e:
            print(f"Gemini API error: {e}")

    # 3. Try OpenAI Cloud API
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {openai_key}"
            }
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.5
                }, timeout=30.0)
                
                if response.status_code == 200:
                    res_json = response.json()
                    text = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if text:
                        insights = [
                            line.strip() 
                            for line in text.split("\n") 
                            if line.strip().startswith(("*", "-", "•", "1", "2", "3", "4", "5", "6", "7", "8", "9"))
                        ]
                        if insights:
                            return {"source": "openai", "insights": insights}
        except Exception as e:
            print(f"OpenAI API error: {e}")

    # 4. Fallback to Local Analytics logic
    local_insights = []
    local_insights.append(f"- Revenue is ${req.currentRevenue:.2f} this week ({'+' if req.revenueGrowth >= 0 else ''}{req.revenueGrowth:.1f}% compared to last week).")
    
    if req.topProducts:
        local_insights.append(f"- {req.topProducts[0].get('name')} contributes ${req.topProducts[0].get('revenue', 0.0) or 0.0:.2f} to total sales.")
    else:
        local_insights.append("- No top product recorded.")

    if req.categoryContributions:
        local_insights.append(f"- {req.categoryContributions[0].get('name')} contributes {req.categoryContributions[0].get('percentage', 0.0) or 0.0}% of total sales.")

    if req.topTables:
        table_names = [t.get('name', '').replace('Table ', '') for t in req.topTables]
        local_insights.append(f"- Tables {' and '.join(table_names)} generate the highest revenue.")

    if req.peakHours:
        ph = req.peakHours[0]
        hour = ph.get('hour') or 0
        start_ampm = "PM" if hour >= 12 else "AM"
        end_ampm = "PM" if hour + 1 >= 12 else "AM"
        start_hour = hour % 12 if hour % 12 != 0 else 12
        end_hour = (hour + 1) % 12 if (hour + 1) % 12 != 0 else 12
        local_insights.append(f"- Sales peak between {start_hour} {start_ampm} and {end_hour} {end_ampm}.")

    if req.productDrops:
        drop = req.productDrops[0]
        local_insights.append(f"- {drop.get('name')} sales dropped {drop.get('dropPercentage', 0.0) or 0.0}% compared to last week.")

    recommend_cat = req.categoryContributions[-1].get('name') if req.categoryContributions else "beverages"
    local_insights.append(f"- Consider running a promotion on {recommend_cat} to boost sales.")

    return {
        "source": "local-analytics-fallback",
        "insights": local_insights
    }
class PromotionProduct(BaseModel):
    id: str
    name: str
    price: float
    stock: Optional[int] = 0
    salesQty: int
    category: str

class GeneratePromotionRequest(BaseModel):
    products: List[PromotionProduct]

@app.post("/generate-promotion")
async def generate_promotion(req: GeneratePromotionRequest):
    import json

    # Format the product lists for the prompt
    products_list = []
    for p in req.products:
        products_list.append(
            f"  * {p.name} (Category: {p.category}): Price: ${p.price:.2f}, Stock: {p.stock}, Sales (Last 30 Days): {p.salesQty} units"
        )
    products_str = "\n".join(products_list)

    prompt = f"""You are a retail marketing and promotion optimization expert for a cafe.
Analyze the following sales and inventory data for the last 30 days and generate a highly effective, structured promotion to boost sales of slow-moving items.

Product Sales & Inventory Data:
{products_str}

Identify:
- Strong-performing products (to use as traffic builders/anchors).
- Slow-moving products (low sales, potentially high stock).

Develop a promotion that:
- Pairs a slow-moving item with a popular item, OR
- Offers a percentage/fixed discount or BOGO on a slow-moving item.

You MUST respond with a single valid JSON object containing exactly these keys:
1. "analysis": A concise explanation of what's performing well vs poorly (e.g. "Coffee sales are strong. Burger sales are weak.").
2. "name": A catchy name for the promotion (max 30 chars).
3. "description": A clear description of the offer (e.g. "Buy 2 Burgers Get 20% Off").
4. "type": Must be exactly one of: "percentage", "fixed_amount", "bogo".
5. "value": A number (e.g. 20.0 for percentage, 5.0 for fixed_amount, or 0.0 for BOGO).
6. "durationDays": Recommended promotion duration in days (integer, e.g. 7, 14, 30).

Do not include any markup like ```json or trailing text. Return ONLY the JSON object.
"""

    print("="*60)
    print("[AI Service] Generate Promotion Prompt:")
    print(prompt)
    print("="*60)

    local_llm_url = os.getenv("LOCAL_LLM_URL")
    local_llm_model = os.getenv("LOCAL_LLM_MODEL", "lm-studio-model")
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    # Helper function to clean and parse JSON
    def clean_and_parse_json(text: str) -> Optional[Dict[str, Any]]:
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()
        try:
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                text = text[start:end+1]
            return json.loads(text)
        except Exception as e:
            print(f"JSON parsing error: {e}. Raw text: {text}")
            return None

    # 1. Try local LLM (e.g., LM Studio)
    if local_llm_url:
        try:
            base_url = local_llm_url.rstrip('/')
            url = f"{base_url}/chat/completions"
            headers = {"Content-Type": "application/json"}
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json={
                    "model": local_llm_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.5
                }, timeout=60.0)
                
                if response.status_code == 200:
                    res_json = response.json()
                    text = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
                    parsed = clean_and_parse_json(text)
                    if parsed:
                        parsed["source"] = f"local-llm ({local_llm_model})"
                        return parsed
        except Exception as e:
            print(f"Local LLM API error in promotion generation: {e}")

    # 2. Try Gemini Cloud API
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json={
                    "contents": [{"parts": [{"text": prompt}]}]
                }, timeout=30.0)
                
                if response.status_code == 200:
                    res_json = response.json()
                    text = res_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    parsed = clean_and_parse_json(text)
                    if parsed:
                        parsed["source"] = "gemini"
                        return parsed
        except Exception as e:
            print(f"Gemini API error in promotion generation: {e}")

    # 3. Try OpenAI Cloud API
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {openai_key}"
            }
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.5
                }, timeout=30.0)
                
                if response.status_code == 200:
                    res_json = response.json()
                    text = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
                    parsed = clean_and_parse_json(text)
                    if parsed:
                        parsed["source"] = "openai"
                        return parsed
        except Exception as e:
            print(f"OpenAI API error in promotion generation: {e}")

    # 4. Fallback logic
    sorted_prods = sorted(req.products, key=lambda x: x.salesQty)
    slow_prod = sorted_prods[0] if sorted_prods else None
    
    analysis = "No products found to analyze."
    name = "Smart Discount"
    description = "Get a discount on selected items."
    p_type = "percentage"
    value = 10.0

    if slow_prod:
        analysis = f"Coffee sales are strong. {slow_prod.name} sales are weak (only {slow_prod.salesQty} sold)."
        name = f"{slow_prod.name} Booster"
        description = f"Buy 2 {slow_prod.name}s Get 20% Off"
        p_type = "percentage"
        value = 20.0

    return {
        "source": "local-fallback",
        "analysis": analysis,
        "name": name,
        "description": description,
        "type": p_type,
        "value": value,
        "durationDays": 7
    }
class ChatRequest(BaseModel):
    message: str
    context: str
    history: Optional[List[Dict[str, str]]] = []

@app.post("/chat")
async def chat_cafe(req: ChatRequest):
    system_prompt = f"""You are "Cafe AI", an intelligent virtual business partner and AI assistant for a cafe owner.
You have access to the following real-time database summary and aggregated business reports:

=== BUSINESS DATABASE CONTEXT ===
{req.context}
================================

Your goal is to answer the cafe owner's questions accurately, professionally, and dynamically based ONLY on the provided context.
- Be concise and focus on actionable insights.
- Format your response using clean Markdown (with lists, tables, bold text, etc.).
- If the context does not contain the answer, say "I don't have enough data to answer that question confidently." but try to suggest what data is missing.
- When asked "Why are sales down?" or similar trend questions, analyze the category contributions or revenue growth values in the context.
- When asked about employees, analyze the staff metrics.
- Keep the tone helpful, professional, and business-focused.
"""

    messages = [{"role": "system", "content": system_prompt}]
    for h in req.history:
        role = h.get("role", "user")
        content = h.get("content", "")
        messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": req.message})

    print("="*60)
    print(f"[AI Service] Chatbot question: {req.message}")
    print("="*60)

    local_llm_url = os.getenv("LOCAL_LLM_URL")
    local_llm_model = os.getenv("LOCAL_LLM_MODEL", "lm-studio-model")
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    # 1. Try local LLM (e.g., LM Studio)
    if local_llm_url:
        try:
            base_url = local_llm_url.rstrip('/')
            url = f"{base_url}/chat/completions"
            headers = {"Content-Type": "application/json"}
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json={
                    "model": local_llm_model,
                    "messages": messages,
                    "temperature": 0.7
                }, timeout=60.0)
                
                if response.status_code == 200:
                    res_json = response.json()
                    text = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if text:
                        return {"source": f"local-llm ({local_llm_model})", "reply": text}
        except Exception as e:
            print(f"Local LLM API error in chatbot: {e}")

    # 2. Try Gemini Cloud API
    if gemini_key:
        try:
            # Combine system prompt with first user message to guarantee compatibility
            combined_prompt = f"{system_prompt}\n\nUser Question:\n{req.message}"
            gemini_contents = []
            for h in req.history:
                role = "user" if h.get("role") == "user" else "model"
                gemini_contents.append({
                    "role": role,
                    "parts": [{"text": h.get("content", "")}]
                })
            # Add final message
            gemini_contents.append({
                "role": "user",
                "parts": [{"text": combined_prompt}]
            })
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json={
                    "contents": gemini_contents
                }, timeout=30.0)
                
                if response.status_code == 200:
                    res_json = response.json()
                    text = res_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if text:
                        return {"source": "gemini", "reply": text}
        except Exception as e:
            print(f"Gemini API error in chatbot: {e}")

    # 3. Try OpenAI Cloud API
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {openai_key}"
            }
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json={
                    "model": "gpt-4o-mini",
                    "messages": messages,
                    "temperature": 0.7
                }, timeout=30.0)
                
                if response.status_code == 200:
                    res_json = response.json()
                    text = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if text:
                        return {"source": "openai", "reply": text}
        except Exception as e:
            print(f"OpenAI API error in chatbot: {e}")

    # 4. Fallback logic
    msg_lower = req.message.lower()
    if "sales" in msg_lower:
        reply = "📊 **Local Analytics Heuristic**:\nSales data shows a steady beverage category performance, but bakery items are currently lagging in transactions. Reviewing your active promotions is highly recommended."
    elif "product" in msg_lower or "remove" in msg_lower or "delete" in msg_lower:
        reply = "🚫 **Menu Recommendation**:\nBased on recent transactions, some bakery items show very low sales volume. Consider running promotions on them first, or retiring them if margins are negative."
    elif "employee" in msg_lower or "staff" in msg_lower or "who" in msg_lower:
        reply = "👥 **Staff Insights**:\nEmployee shifts logs show `Employee User` has processed the highest volume of order checks this month."
    elif "table" in msg_lower:
        reply = "🪑 **Table Insights**:\nTable 2 and Table 5 are generating the highest revenue of all seating structures."
    else:
        reply = "🤖 **Cafe AI**:\nI am running in local fallback mode. Please check your API keys to get advanced, data-driven business answers from the LLM."

    return {
        "source": "local-fallback",
        "reply": reply
    }

if __name__ == "__main__":
    import uvicorn
    # Self-runnable option to launch uvicorn server directly
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
