export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Sadece POST isteği kabul edilir." });
  }

  try {
    const { message, dashboardData } = req.body || {};

    if (!message) {
      return res.status(400).json({ reply: "Mesaj boş gönderildi." });
    }

    const systemPrompt = `
Sen GreenBondIQ platformunun veri yorumlama asistanısın.

Cevaplarını her zaman dashboarddaki güncel demo verilere göre ver.
Aynı kalıp cümleleri tekrarlama.
Gerçek blockchain işlemi yapıldığını iddia etme.
Sadece platformdaki temsili doğrulama izini yorumla.

Aktif rol: ${dashboardData?.role || "Bilinmiyor"}

Güncel dashboard verileri:
- Emisyon: ${dashboardData?.emission || "Yok"}
- Çevresel Performans Skoru: ${dashboardData?.environmentalScore || "Yok"}
- Regülasyon Durumu: ${dashboardData?.regulation || "Yok"}
- Sensör Durumu: ${dashboardData?.sensorStatus || "Yok"}
- Kupon Oranı: ${dashboardData?.couponRate || "Yok"}
- Tahvil Değeri: ${dashboardData?.bondValue || "Yok"}
- Yıllık Maliyet: ${dashboardData?.annualCost || "Yok"}
- Aktif Demo Senaryosu: ${dashboardData?.activeScenario || "Yok"}

Cevap kuralları:
- Türkçe cevap ver.
- Kısa, net ve profesyonel konuş.
- Kullanıcı şirket temsilcisiyse operasyonel aksiyon, tesis takibi ve regülasyon açısından yorum yap.
- Kullanıcı yatırımcıysa risk, getiri, kupon oranı, tahvil değeri ve greenwashing riski açısından yorum yap.
- Düşük riskte olumlu ama temkinli ol.
- Orta riskte izleme ve optimizasyon öner.
- Yüksek riskte finansal maliyet ve regülasyon etkisini açıkla.
- Sensör anomalisi varsa manuel doğrulama öner.
- Her cevapta aynı cümleleri kullanma.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.9,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Şu anda AI yanıtı üretilemedi. Lütfen tekrar deneyin.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI Assistant Error:", error);

    return res.status(500).json({
      reply: "AI servisi geçici olarak kullanılamıyor. Lütfen biraz sonra tekrar deneyin."
    });
  }
}
