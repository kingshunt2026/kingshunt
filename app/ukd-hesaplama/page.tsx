"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/section-heading";

// UKD hesaplama fonksiyonu (ELO benzeri sistem)
function calculateUKD(
  currentUKD: number,
  opponentUKD: number,
  result: number, // 1 = kazanç, 0.5 = beraberlik, 0 = kayıp
  kFactor: number = 32
): number {
  // Beklenen skor hesaplama
  const expectedScore = 1 / (1 + Math.pow(10, (opponentUKD - currentUKD) / 400));
  
  // Yeni UKD hesaplama
  const newUKD = currentUKD + kFactor * (result - expectedScore);
  
  return Math.round(newUKD);
}

export default function UKDHesaplamaPage() {
  const [currentUKD, setCurrentUKD] = useState<string>("");
  const [opponentUKD, setOpponentUKD] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const [newUKD, setNewUKD] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{
    opponentUKD: number;
    result: number;
    newUKD: number;
  }>>([]);

  const handleCalculate = () => {
    if (!currentUKD || !opponentUKD || result === null) {
      return;
    }

    const current = parseFloat(currentUKD);
    const opponent = parseFloat(opponentUKD);

    if (isNaN(current) || isNaN(opponent)) {
      return;
    }

    const calculated = calculateUKD(current, opponent, result);
    setNewUKD(calculated);
    
    // Geçmişe ekle
    setHistory(prev => [{
      opponentUKD: opponent,
      result,
      newUKD: calculated
    }, ...prev].slice(0, 10)); // Son 10 hesaplamayı sakla
  };

  const handleReset = () => {
    setCurrentUKD("");
    setOpponentUKD("");
    setResult(null);
    setNewUKD(null);
  };

  const handleAddToHistory = () => {
    if (newUKD !== null) {
      setCurrentUKD(newUKD.toString());
      setOpponentUKD("");
      setResult(null);
      setNewUKD(null);
    }
  };

  const getResultLabel = (res: number) => {
    if (res === 1) return "Kazandınız";
    if (res === 0.5) return "Berabere";
    return "Kaybettiniz";
  };

  const getResultColor = (res: number) => {
    if (res === 1) return "text-green-600";
    if (res === 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="text-[#0b0b0b]">
      <section className="relative overflow-hidden border-b border-[#0b0b0b]/5 bg-gradient-to-b from-white via-[#f4ecde] to-[#f7f4ec]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(201,162,77,0.12),transparent_32%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <SectionHeading
            align="center"
            eyebrow="UKD Hesaplama"
            title="Ulusal Kuvvet Derecesi Hesaplayıcı"
            subtitle="Mevcut UKD'nizi ve rakip UKD'sini girerek yeni UKD'nizi hesaplayın."
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Hesaplama Formu */}
          <div className="rounded-3xl border border-[#0b0b0b]/6 bg-white p-6 md:p-8 shadow-xl shadow-black/10">
            <h3 className="text-xl font-semibold text-[#0b0b0b] mb-6">
              UKD Hesaplama
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0b0b0b]/80 mb-2">
                  Mevcut UKD'niz
                </label>
                <input
                  type="number"
                  value={currentUKD}
                  onChange={(e) => setCurrentUKD(e.target.value)}
                  placeholder="Örn: 1500"
                  className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b0b0b]/80 mb-2">
                  Rakip UKD'si
                </label>
                <input
                  type="number"
                  value={opponentUKD}
                  onChange={(e) => setOpponentUKD(e.target.value)}
                  placeholder="Örn: 1600"
                  className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] placeholder:text-[#4a4a4a]/60 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b0b0b]/80 mb-2">
                  Sonuç
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setResult(1)}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      result === 1
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-[#0b0b0b]/10 bg-[#f7f4ec] text-[#0b0b0b] hover:border-green-400"
                    }`}
                  >
                    Kazandınız
                  </button>
                  <button
                    onClick={() => setResult(0.5)}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      result === 0.5
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-[#0b0b0b]/10 bg-[#f7f4ec] text-[#0b0b0b] hover:border-yellow-400"
                    }`}
                  >
                    Berabere
                  </button>
                  <button
                    onClick={() => setResult(0)}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      result === 0
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-[#0b0b0b]/10 bg-[#f7f4ec] text-[#0b0b0b] hover:border-red-400"
                    }`}
                  >
                    Kaybettiniz
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCalculate}
                  disabled={!currentUKD || !opponentUKD || result === null}
                  className="flex-1 rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:shadow-gold-400/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Hesapla
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-full border border-[#0b0b0b]/10 bg-white px-5 py-3 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#f7f4ec]"
                >
                  Temizle
                </button>
              </div>
            </div>

            {/* Sonuç */}
            {newUKD !== null && (
              <div className="mt-6 rounded-2xl border border-gold-400/50 bg-gold-500/15 p-6">
                <p className="text-sm font-medium text-gold-700 mb-2">
                  Yeni UKD'niz
                </p>
                <p className="text-3xl font-bold text-gold-800">
                  {newUKD}
                </p>
                {currentUKD && (
                  <p className="mt-2 text-sm text-gold-600">
                    {newUKD > parseFloat(currentUKD) ? (
                      <span className="text-green-600">
                        ↑ +{newUKD - parseFloat(currentUKD)} puan
                      </span>
                    ) : newUKD < parseFloat(currentUKD) ? (
                      <span className="text-red-600">
                        ↓ {newUKD - parseFloat(currentUKD)} puan
                      </span>
                    ) : (
                      <span>Değişmedi</span>
                    )}
                  </p>
                )}
                <button
                  onClick={handleAddToHistory}
                  className="mt-4 w-full rounded-full border border-gold-400/50 bg-white px-4 py-2 text-sm font-semibold text-gold-800 transition hover:bg-gold-50"
                >
                  Yeni UKD'yi Kullan
                </button>
              </div>
            )}
          </div>

          {/* Bilgi ve Geçmiş */}
          <div className="space-y-6">
            {/* UKD Hakkında Bilgi */}
            <div className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/5">
              <h4 className="text-base font-semibold text-[#0b0b0b] mb-3">
                UKD Nedir?
              </h4>
              <p className="text-sm text-[#4a4a4a] leading-relaxed">
                UKD (Ulusal Kuvvet Derecesi), Türkiye Satranç Federasyonu tarafından 
                kullanılan bir rating sistemidir. ELO sistemine benzer şekilde çalışır 
                ve oyuncuların gücünü sayısal olarak ifade eder.
              </p>
              <div className="mt-4 space-y-2 text-xs text-[#4a4a4a]">
                <p><span className="font-semibold text-[#0b0b0b]">• K-Faktörü:</span> 32 (standart)</p>
                <p><span className="font-semibold text-[#0b0b0b]">• Beklenen Skor:</span> Rakip UKD'sine göre hesaplanır</p>
                <p><span className="font-semibold text-[#0b0b0b]">• Yeni UKD:</span> Mevcut UKD + K × (Sonuç - Beklenen Skor)</p>
              </div>
            </div>

            {/* Hesaplama Geçmişi */}
            {history.length > 0 && (
              <div className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-6 shadow-lg shadow-black/5">
                <h4 className="text-base font-semibold text-[#0b0b0b] mb-4">
                  Son Hesaplamalar
                </h4>
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-[#0b0b0b]/5 bg-[#f7f4ec] px-4 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold ${getResultColor(item.result)}`}>
                          {getResultLabel(item.result)}
                        </span>
                        <span className="text-xs text-[#4a4a4a]">
                          vs {item.opponentUKD}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gold-700">
                        {item.newUKD}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

