import { GoogleGenerativeAI } from '@google/generative-ai';
import Inventory from '../models/Inventory.js';
import Order from '../models/Order.js';
import DeliveryCompliance from '../models/DeliveryCompliance.js';

// ─── Fetch live data from DB ───────────────────────────────────────────
async function getLiveData() {
  let inventory = [], orders = [], compliance = [];
  try { inventory = await Inventory.find({}).lean(); } catch (e) {}
  try { orders = await Order.find({}).lean(); } catch (e) {}
  try { compliance = await DeliveryCompliance.find({}).lean(); } catch (e) {}
  return { inventory, orders, compliance };
}

// ─── Build system context string ──────────────────────────────────────
async function buildSystemContext() {
  const { inventory, orders, compliance } = await getLiveData();

  const inventoryInfo = inventory.length > 0
    ? inventory.map(item =>
        `• ${item.productName} (${item.productCode}): ${item.availableQuantity} tons [${item.availableQuantity < 200 ? 'LOW STOCK ⚠️' : 'In Stock ✅'}]`
      ).join('\n')
    : 'No inventory records loaded.';

  const orderInfo = orders.length > 0
    ? orders.map(o =>
        `• Order ${o.orderId} | Customer: ${o.customerId} | Product: ${o.productCode} | Demand: ${o.demandQuantity} tons`
      ).join('\n')
    : 'No orders in the system.';

  const complianceInfo = compliance.length > 0
    ? (() => {
        const total = compliance.length;
        const complied = compliance.filter(r => r.status === 'Fully Complied').length;
        const rate = ((complied / total) * 100).toFixed(1);
        return `Overall Compliance Rate: ${rate}% (${complied}/${total} orders fully complied)\n` +
          compliance.map(r =>
            `• ${r.orderId} | ${r.customerId} | ${r.productCode} | Demand: ${r.demandQuantity}t | Stock: ${r.availableQuantity}t | Status: ${r.status}`
          ).join('\n');
      })()
    : 'No compliance records available.';

  return `You are ARIA (Advanced Real-time Intelligence Assistant), the AI assistant for the Tata Steel Delivery Compliance Improvement System. You are professional, knowledgeable, and concise.

ABOUT THIS SYSTEM:
The Tata Steel Delivery Compliance Improvement System manages steel product orders, tracks yard inventory, calculates delivery compliance, detects shortages, and generates SLA reports. It serves Jamshedpur Works (12 Mtpa), Kalinganagar Plant (8 Mtpa), and Meramandali Plant (5 Mtpa).

PRODUCTS:
- Hot Rolled Coils (HRC): Used in construction, automotive industries
- Cold Rolled Sheets (CRS): Superior surface finish for appliances, automotive
- Wire Rods: Used in construction reinforcement and wire manufacturing  
- Steel Slabs: Semi-finished products for further processing

COMPLIANCE LOGIC:
- Fully Complied = Available Stock >= Demand Quantity
- Partially Complied/Delayed = Stock < Demand (shortage detected)
- Compliance Score = (Available / Demand) × 100%

LIVE INVENTORY DATA:
${inventoryInfo}

LIVE ORDERS DATA:
${orderInfo}

LIVE COMPLIANCE DATA:
${complianceInfo}

Answer all questions accurately using the live data above. Be concise but thorough. Use bullet points where helpful.`;
}

// ─── Rule-based fallback (no API key required) ────────────────────────
async function ruleBasedAnswer(message) {
  const { inventory, orders, compliance } = await getLiveData();
  const msg = message.toLowerCase();

  // Inventory queries
  if (msg.includes('inventory') || msg.includes('stock') || msg.includes('product') || msg.includes('material') || msg.includes('available')) {
    if (inventory.length === 0) {
      return "No inventory records are currently loaded in the system. Please seed the database or add inventory items.";
    }

    const total = inventory.reduce((sum, i) => sum + i.availableQuantity, 0);
    const low = inventory.filter(i => i.availableQuantity < 200);

    let response = `**📦 Current Yard Inventory (${inventory.length} products)**\n\n`;
    inventory.forEach(item => {
      const status = item.availableQuantity < 200 ? '⚠️ LOW' : '✅ OK';
      response += `- **${item.productName}** (${item.productCode}): **${item.availableQuantity} tons** [${status}]\n`;
    });
    response += `\n**Total Stock:** ${total} tons`;
    if (low.length > 0) {
      response += `\n\n⚠️ **${low.length} product(s) below safety threshold (200t):** ${low.map(i => i.productName).join(', ')}`;
    }
    return response;
  }

  // Compliance queries
  if (msg.includes('compliance') || msg.includes('complied') || msg.includes('audit') || msg.includes('sla')) {
    if (compliance.length === 0) {
      return "No compliance records found. Please create orders and run compliance calculations first.";
    }
    const total = compliance.length;
    const complied = compliance.filter(r => r.status === 'Fully Complied').length;
    const delayed = total - complied;
    const rate = ((complied / total) * 100).toFixed(1);

    let response = `**📊 Delivery Compliance Summary**\n\n`;
    response += `- **Overall Rate:** ${rate}%\n`;
    response += `- **Fully Complied:** ${complied} / ${total} orders ✅\n`;
    response += `- **Delayed / Shortage:** ${delayed} / ${total} orders ⚠️\n\n`;
    response += `**Recent Records:**\n`;
    compliance.slice(0, 5).forEach(r => {
      const icon = r.status === 'Fully Complied' ? '✅' : '⚠️';
      response += `- ${icon} Order **${r.orderId}** | ${r.productCode} | ${r.status}\n`;
    });
    return response;
  }

  // Order queries
  if (msg.includes('order') || msg.includes('demand') || msg.includes('customer')) {
    if (orders.length === 0) {
      return "No orders found in the system. Use the 'Create Order' section to add new orders.";
    }
    let response = `**📋 Active Orders (${orders.length} total)**\n\n`;
    orders.slice(0, 8).forEach(o => {
      response += `- **${o.orderId}** | Customer: ${o.customerId} | Product: ${o.productCode} | Demand: ${o.demandQuantity} tons\n`;
    });
    if (orders.length > 8) response += `\n...and ${orders.length - 8} more orders.`;
    return response;
  }

  // Shortage queries
  if (msg.includes('shortage') || msg.includes('delay') || msg.includes('short')) {
    const delayed = compliance.filter(r => r.status !== 'Fully Complied');
    if (delayed.length === 0) {
      return "✅ **No shortages detected!** All orders are currently fully complied.";
    }
    let response = `**⚠️ Shortage / Delay Report (${delayed.length} orders)**\n\n`;
    delayed.forEach(r => {
      response += `- Order **${r.orderId}** | ${r.productCode} | Shortfall: **${r.delayQty} tons**\n`;
    });
    return response;
  }

  // Plant queries
  if (msg.includes('jamshedpur') || msg.includes('jms')) {
    return `**🏭 Jamshedpur Works**\n\n- **Capacity:** 12 Mtpa (Mega Tonnes per Annum)\n- **Type:** Flagship integrated steelmaking facility\n- **Products:** Hot Rolled Coils, Cold Rolled Sheets, Steel Slabs\n- **Features:** Blast furnace, rolling mills, full value-chain production\n- **Status:** Active — telemetry linked`;
  }
  if (msg.includes('kalinganagar') || msg.includes('kln')) {
    return `**🏭 Kalinganagar Plant**\n\n- **Capacity:** 8 Mtpa\n- **Type:** Highly automated processing center\n- **Products:** Hot Rolled Coils, Wire Rods, Steel Slabs\n- **Features:** Advanced automation, flat and high-grade steel\n- **Status:** Active — telemetry linked`;
  }
  if (msg.includes('meramandali') || msg.includes('mrm')) {
    return `**🏭 Meramandali Plant**\n\n- **Capacity:** 5 Mtpa\n- **Type:** High-speed rolling mills\n- **Products:** Wire Rods, Cold Rolled Sheets, Hot Rolled Coils\n- **Features:** Structural steel and wire production\n- **Status:** Active — telemetry linked`;
  }
  if (msg.includes('plant') || msg.includes('facility') || msg.includes('location')) {
    return `**🏭 Tata Steel Plants — Delivery Compliance System**\n\n- **Jamshedpur Works** — 12 Mtpa | HRC, CRS, Slabs\n- **Kalinganagar Plant** — 8 Mtpa | HRC, Wire Rods, Slabs\n- **Meramandali Plant** — 5 Mtpa | Wire Rods, CRS, HRC\n\nAll three plants are connected with real-time telemetry. You can run compliance simulations for each on the landing page.`;
  }

  // Product queries
  if (msg.includes('hot rolled') || msg.includes('hrc')) {
    return `**🔩 Hot Rolled Coils (HRC)**\n\n- Produced by hot rolling steel at temperatures above 900°C\n- Used in: Construction, automotive frames, shipbuilding, pipes\n- Available at: Jamshedpur, Kalinganagar, Meramandali\n- Characteristic: Rough surface finish, slightly larger tolerances`;
  }
  if (msg.includes('cold rolled') || msg.includes('crs')) {
    return `**🔩 Cold Rolled Sheets (CRS)**\n\n- Produced by further rolling HRC at room temperature\n- Tighter dimensional tolerances and superior surface finish\n- Used in: Appliances, automotive body panels, electronics\n- Available at: Jamshedpur, Meramandali`;
  }
  if (msg.includes('wire rod')) {
    return `**🔩 Wire Rods**\n\n- Long steel products rolled into coiled rods\n- Used in: Construction rebars, wire drawing, springs\n- Available at: Kalinganagar, Meramandali`;
  }
  if (msg.includes('slab')) {
    return `**🔩 Steel Slabs**\n\n- Semi-finished steel products (rectangular cross-section)\n- Further processed into sheets, coils, or plates\n- Available at: Jamshedpur, Kalinganagar`;
  }

  // System / general queries
  if (msg.includes('what') && (msg.includes('system') || msg.includes('this') || msg.includes('app') || msg.includes('about'))) {
    return `**🏭 Tata Steel Delivery Compliance Improvement System**\n\nThis is a full-stack web platform that:\n\n- **📦 Inventory Management** — Track yard stock for all products across plants\n- **📋 Order Processing** — Create and manage customer demand orders\n- **✅ Compliance Auditing** — Compare demand vs available stock in real-time\n- **⚠️ Shortage Detection** — Automatic alerts when stock < demand\n- **📊 Analytics** — Compliance rates, fulfillment ratios, delay tracking\n- **🔐 Secure Access** — JWT-authenticated role-based operator login\n\nPlants monitored: Jamshedpur, Kalinganagar, Meramandali`;
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `**Hello! 👋 I'm ARIA**, your AI assistant for the Tata Steel Delivery Compliance System.\n\nI can help you with:\n- **Inventory** — current stock levels\n- **Compliance** — order audit status\n- **Shortages** — delayed or at-risk orders\n- **Plants** — Jamshedpur, Kalinganagar, Meramandali info\n- **Products** — HRC, CRS, Wire Rods, Slabs\n\nWhat would you like to know?`;
  }

  // Greetings — time of day
  if (msg.includes('good morning')) {
    return `Good morning! ☀️ Hope you're having a great start to your day!\n\nI'm **ARIA**, ready to assist you with the Tata Steel Delivery Compliance System. Ask me anything about inventory, compliance records, plant operations, or order status!`;
  }
  if (msg.includes('good afternoon')) {
    return `Good afternoon! 🌤️ Great to hear from you!\n\nI'm **ARIA** — your assistant for the Tata Steel system. Feel free to ask me about inventory levels, compliance audits, shortages, or anything else you need!`;
  }
  if (msg.includes('good evening')) {
    return `Good evening! 🌙 Thanks for checking in!\n\nI'm **ARIA**, always available to help. Ask me about stock levels, compliance records, plant data, or order status anytime!`;
  }
  if (msg.includes('good night')) {
    return `Good night! 🌙 Take care and rest well!\n\nI'll be here whenever you need compliance or inventory assistance. Have a good one! 😊`;
  }

  // How are you / wellbeing
  if (msg.includes('how are you') || msg.includes('how r u') || msg.includes('how are u') || msg.includes('hows it going') || msg.includes("how's it going") || msg.includes('how do you do')) {
    return `I'm doing great, thank you for asking! 😊\n\nAs an AI assistant, I'm always up and running, ready to help you with the Tata Steel Delivery Compliance System.\n\nHow can I assist you today? Whether it's inventory, compliance, or orders — I'm here for you!`;
  }

  // Thank you
  if (msg.includes('thank you') || msg.includes('thanks') || msg.includes('thx') || msg.includes('ty') || msg.includes('thank u')) {
    return `You're most welcome! 😊 Happy to help!\n\nIf you have any more questions about inventory, compliance, plants, or orders — just ask. I'm always here!`;
  }

  // Goodbye / bye
  if (msg.includes('bye') || msg.includes('goodbye') || msg.includes('see you') || msg.includes('see ya') || msg.includes('take care') || msg.includes('cya')) {
    return `Goodbye! 👋 Take care and have a wonderful day!\n\nFeel free to come back anytime you need compliance or inventory assistance. I'll be right here! 😊`;
  }

  // Nice / Great / Awesome
  if (msg.includes('nice') || msg.includes('great') || msg.includes('awesome') || msg.includes('cool') || msg.includes('wow') || msg.includes('amazing') || msg.includes('excellent')) {
    return `Glad you think so! 😊\n\nIs there anything else I can help you with? Feel free to ask about inventory, compliance, plants, or orders!`;
  }

  // OK / Okay / Alright / Sure
  if (msg === 'ok' || msg === 'okay' || msg === 'alright' || msg === 'sure' || msg === 'fine' || msg === 'got it' || msg === 'understood') {
    return `Alright! 👍 Let me know if there's anything else you'd like to know.\n\nI'm here to help with inventory, compliance records, plant info, or order status anytime!`;
  }

  // What's your name
  if (msg.includes('your name') || msg.includes('who are you') || msg.includes('what are you') || msg.includes('introduce yourself')) {
    return `I'm **ARIA** — *Advanced Real-time Intelligence Assistant* 🤖\n\nI'm the AI assistant for the **Tata Steel Delivery Compliance Improvement System**. I have live access to:\n\n- 📦 **Inventory & Stock data**\n- 📊 **Compliance & Audit records**\n- ⚠️ **Shortage & Delay alerts**\n- 🏭 **Plant information** (Jamshedpur, Kalinganagar, Meramandali)\n\nWhat would you like to explore?`;
  }

  if (msg.includes('help') || msg.includes('can you') || msg.includes('what can')) {
    return `**🤖 ARIA Capabilities**\n\nYou can ask me about:\n\n- 📦 **Inventory** — "What is the current stock?" / "Show inventory"\n- 📊 **Compliance** — "What is the compliance rate?" / "Show audit records"\n- ⚠️ **Shortages** — "Which orders have shortages?" / "Any delays?"\n- 🏭 **Plants** — "Tell me about Jamshedpur" / "Kalinganagar capacity"\n- 🔩 **Products** — "What are Hot Rolled Coils?" / "Tell me about Wire Rods"\n- 📋 **Orders** — "Show active orders" / "Customer demand"\n\nJust type your question naturally!`;
  }

  // Default
  return `Hey! I got your message. 😊 I'm **ARIA**, the Tata Steel AI assistant.\n\nI'm best at answering questions about this system. Here's what I can help with:\n- 📦 **Inventory & Stock levels**\n- 📊 **Compliance & Audit records**\n- ⚠️ **Shortages & Delays**\n- 🏭 **Plant information** (Jamshedpur, Kalinganagar, Meramandali)\n- 🔩 **Product details** (HRC, CRS, Wire Rods, Slabs)\n\nTry asking: *"What is the current inventory?"* or *"Show me compliance records."*`;
}

// ─── Main Chat Handler ─────────────────────────────────────────────────
export const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey = apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here';

    // ── Use Gemini if key is available ──
    if (hasValidKey) {
      try {
        const systemContext = await buildSystemContext();
        const genAI = new GoogleGenerativeAI(apiKey);

        // Pass systemInstruction to getGenerativeModel (correct placement)
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: systemContext,
        });

        const formattedHistory = history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
          history: formattedHistory,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        });

        const result = await chat.sendMessage(message.trim());
        const text = result.response.text();
        return res.json({ reply: text, source: 'gemini' });
      } catch (geminiError) {
        console.error('Gemini error, falling back to rule-based:', geminiError.message);
        // Fall through to rule-based
      }
    }

    // ── Rule-based fallback ──
    const reply = await ruleBasedAnswer(message.trim());
    return res.json({
      reply,
      source: 'fallback',
      note: hasValidKey ? 'Gemini unavailable, using smart fallback.' : undefined
    });

  } catch (error) {
    console.error('Chat handler error:', error);
    res.status(500).json({ error: 'AI assistant encountered an error. Please try again.' });
  }
};
