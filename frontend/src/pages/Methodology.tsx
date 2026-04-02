import { Link } from 'react-router-dom'

export default function Methodology() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link to="/dashboard" className="text-xs text-sage-600 hover:text-sage-700">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-slate-800 mt-3">Eco estimate methodology</h1>
        <p className="text-sm text-slate-400 mt-1">
          How Ami estimates the environmental footprint of your AI subscriptions.
        </p>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-700">Energy (kWh / month)</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Each subscription is assigned a monthly energy estimate based on its AI category and your
          self-reported usage level (light / moderate / heavy). These are rough order-of-magnitude
          figures derived from published research on inference costs:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-500 border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 font-medium text-slate-600">Category</th>
                <th className="text-right py-2 pr-4 font-medium text-slate-600">Light</th>
                <th className="text-right py-2 pr-4 font-medium text-slate-600">Moderate</th>
                <th className="text-right py-2 font-medium text-slate-600">Heavy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { cat: 'Chat / Writing / Coding', light: '0.30–0.45', mod: '1.2–1.8', heavy: '3.6–5.4' },
                { cat: 'Image generation',         light: '0.60',      mod: '3.0',     heavy: '10.0' },
                { cat: 'Audio generation',         light: '0.15',      mod: '0.60',    heavy: '1.5' },
                { cat: 'Video generation',         light: '0.50',      mod: '2.0',     heavy: '6.0' },
              ].map((r) => (
                <tr key={r.cat}>
                  <td className="py-2 pr-4">{r.cat}</td>
                  <td className="text-right py-2 pr-4">{r.light} kWh</td>
                  <td className="text-right py-2 pr-4">{r.mod} kWh</td>
                  <td className="text-right py-2">{r.heavy} kWh</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400">
          Sources: Li et al. (2023) "Making AI Less Thirsty"; Patterson et al. (2022) "Carbon
          Emissions and Large Neural Network Training"; Luccioni et al. (2023) "Power Hungry
          Processing". Figures are approximate and vary significantly by model size, provider
          infrastructure, and actual usage patterns.
        </p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Carbon emissions (kg CO₂e / month)</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Energy (kWh) is converted to carbon using a grid carbon intensity factor:
        </p>
        <pre className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 overflow-x-auto">
          CO₂e (kg) = kWh × carbon_intensity (kg CO₂e / kWh)
        </pre>
        <p className="text-sm text-slate-500 leading-relaxed">
          The default intensity is <strong>0.386 kg CO₂e / kWh</strong>, which approximates the
          US average grid mix (EPA eGRID 2022). This is adjustable in Settings → Eco preferences
          to reflect cleaner or dirtier regional grids.
        </p>
        <p className="text-sm text-slate-500 leading-relaxed">
          The driving equivalent converts kg CO₂e to miles using the US EPA figure of{' '}
          <strong>0.404 kg CO₂e per mile</strong> for an average gasoline passenger vehicle.
        </p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Water usage (liters / month)</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Data centers use water for cooling. Ami estimates water consumption using a water usage
          effectiveness (WUE) ratio applied to energy consumed:
        </p>
        <pre className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 overflow-x-auto">
          Water (L) = kWh × 1.5 L/kWh
        </pre>
        <p className="text-sm text-slate-500 leading-relaxed">
          The 1.5 L/kWh factor is a conservative estimate based on Li et al. (2023), which found
          that training GPT-3 required approximately 700,000 liters of water. Inference workloads
          are less water-intensive per query but still significant at scale.
        </p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Compute intensity score (0–100)</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          The compute intensity score reflects the relative GPU/CPU load per individual inference
          request, normalised across AI categories. It is independent of usage volume — a video
          generation job scores high even at "light" usage because each video render is inherently
          GPU-intensive.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-500 border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 font-medium text-slate-600">Category</th>
                <th className="text-right py-2 pr-4 font-medium text-slate-600">Light</th>
                <th className="text-right py-2 pr-4 font-medium text-slate-600">Moderate</th>
                <th className="text-right py-2 font-medium text-slate-600">Heavy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { cat: 'Chat / Writing / Coding', light: 20, mod: 28, heavy: 35 },
                { cat: 'Image generation',         light: 50, mod: 65, heavy: 80 },
                { cat: 'Audio generation',         light: 55, mod: 70, heavy: 80 },
                { cat: 'Video generation',         light: 70, mod: 85, heavy: 95 },
              ].map((r) => (
                <tr key={r.cat}>
                  <td className="py-2 pr-4">{r.cat}</td>
                  <td className="text-right py-2 pr-4">{r.light}</td>
                  <td className="text-right py-2 pr-4">{r.mod}</td>
                  <td className="text-right py-2">{r.heavy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5 bg-amber-50/40 border border-amber-100">
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Important caveat:</strong> All figures are rough estimates. Actual environmental
          impact depends on the provider's data center location, energy mix, hardware efficiency,
          and the nature of your specific workloads. Ami's numbers are intended to give a
          directional sense of scale, not a precise accounting.
        </p>
      </div>
    </div>
  )
}
