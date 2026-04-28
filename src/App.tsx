import { useState } from 'react';
import './App.css';
import { projectStrategy, computeOptimalRate } from './computations';

const DEFAULTS = {
  basePay: 6177.30,
  contributedSoFar: 8524.69,
  currentRate: 33,
  agencyAutoSoFar: 247.08,
  agencyMatchSoFar: 988.36,
  maxAnnualContribution: 24500,
  maxMatchPercent: 4,
  autoContributionPercent: 1,
  totalPayPeriods: 12
};

const getSliderOffset = (percent: number) => `calc(14px + (100% - 28px) * ${percent / 100})`;

function App() {
  const [basePayInput, setBasePayInput] = useState<string>(DEFAULTS.basePay.toFixed(2));
  const [contributedSoFarInput, setContributedSoFarInput] = useState<string>(DEFAULTS.contributedSoFar.toFixed(2));
  const [currentRateStr, setCurrentRateStr] = useState<string>(DEFAULTS.currentRate.toString());
  const [agencyAutoSoFarInput, setAgencyAutoSoFarInput] = useState<string>(DEFAULTS.agencyAutoSoFar.toFixed(2));
  const [agencyMatchSoFarInput, setAgencyMatchSoFarInput] = useState<string>(DEFAULTS.agencyMatchSoFar.toFixed(2));
  const [maxAnnualContributionInput, setMaxAnnualContributionInput] = useState<string>(DEFAULTS.maxAnnualContribution.toFixed(2));
  
  const basePay = Number(basePayInput) || 0;
  const contributedSoFar = Number(contributedSoFarInput) || 0;
  const agencyAutoSoFar = Number(agencyAutoSoFarInput) || 0;
  const agencyMatchSoFar = Number(agencyMatchSoFarInput) || 0;
  const maxAnnualContribution = Number(maxAnnualContributionInput) || 0;
  const autoContributionPercent = DEFAULTS.autoContributionPercent;
  const maxMatchPercent = DEFAULTS.maxMatchPercent;
  const [totalPayPeriods, setTotalPayPeriods] = useState<number>(DEFAULTS.totalPayPeriods);
  const [currentPeriod, setCurrentPeriod] = useState<number>(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    return currentMonth + (today.getDate() > 15 ? 1 : 0);
  });

  // Derive numeric currentRate from the string state
  let currentRate = parseInt(currentRateStr, 10);
  if (isNaN(currentRate)) currentRate = 0;
  currentRate = Math.max(0, Math.min(100, currentRate));

  const handleReset = () => {
    setBasePayInput(DEFAULTS.basePay.toFixed(2));
    setContributedSoFarInput(DEFAULTS.contributedSoFar.toFixed(2));
    setCurrentRateStr(DEFAULTS.currentRate.toString());
    setAgencyAutoSoFarInput(DEFAULTS.agencyAutoSoFar.toFixed(2));
    setAgencyMatchSoFarInput(DEFAULTS.agencyMatchSoFar.toFixed(2));
    setMaxAnnualContributionInput(DEFAULTS.maxAnnualContribution.toFixed(2));
    setTotalPayPeriods(DEFAULTS.totalPayPeriods);
    const today = new Date();
    setCurrentPeriod(today.getMonth() + (today.getDate() > 15 ? 1 : 0));
  };

  const handleMoneyBlur = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setter(num.toFixed(2));
    }
  };

  const remainingPayPeriods = Math.max(0, totalPayPeriods - currentPeriod);

  const sharedParams = {
    basePay,
    contributedSoFar,
    agencyMatchSoFar,
    agencyAutoSoFar,
    maxAnnualContribution,
    autoContributionPercent,
    maxMatchPercent,
    remainingPayPeriods,
  };

  // --- CURRENT RATE PROJECTIONS ---
  const {
    totalContribution: totalCurrentContribution,
    totalMatch: totalCurrentMatch,
    totalAuto,
    periodsWithLostMatch,
    hitLimitEarly,
    lostMatchAmount,
  } = projectStrategy({ ...sharedParams, ratePercent: currentRate });

  const totalCurrentValue = totalCurrentContribution + totalCurrentMatch + totalAuto;

  // --- OPTIMAL PROJECTIONS ---
  const optimalContributionRate = computeOptimalRate({ contributedSoFar, maxAnnualContribution, remainingPayPeriods, basePay });

  const {
    totalContribution: totalOptimalContribution,
    totalMatch: totalOptimalMatch,
    totalAuto: totalOptimalAuto,
    lostMatchAmount: optStrategyLostMatch,
  } = projectStrategy({ ...sharedParams, ratePercent: optimalContributionRate });

  const totalOptimalValue = totalOptimalContribution + totalOptimalMatch + totalOptimalAuto;
  const willLoseMatch = optStrategyLostMatch > 0;

  // --- CAPTURE MAX MATCH STRATEGY (5%) ---
  const {
    totalContribution: totalMinContrib,
    totalMatch: totalMinMatch,
    totalAuto: totalMinAuto,
  } = projectStrategy({ ...sharedParams, ratePercent: 5 });

  const totalMinValue = totalMinContrib + totalMinMatch + totalMinAuto;

  let currentStrategyTooltip;
  if (currentRate < 5) {
     currentStrategyTooltip = `Because your rate is under 5%, you are missing out on $${lostMatchAmount.toFixed(2)} in free agency matching money over the remaining pay periods.`;
  } else if (periodsWithLostMatch > 0) {
     currentStrategyTooltip = `Your rate is so high that you hit the $${maxAnnualContribution.toFixed(2)} limit early. Your contributions drop to zero (or below 5%) for ${periodsWithLostMatch} pay period(s), meaning you lose out on $${lostMatchAmount.toFixed(2)} in agency matching!`;
  } else if (hitLimitEarly) {
     currentStrategyTooltip = `You hit your $${maxAnnualContribution.toFixed(2)} limit on the final pay period! Your final contribution is capped. However, because your final fractional contribution is still larger than the 5% threshold ($${(basePay * 0.05).toFixed(2)}), you still receive the FULL 4% agency match. No matching is lost!`;
  } else if (currentRate < optimalContributionRate - 0.01) {
     currentStrategyTooltip = `You will not hit the $${maxAnnualContribution.toFixed(2)} IRS limit this year. You are securing the full match, but leaving tax-advantaged contribution space on the table.`;
  } else {
     currentStrategyTooltip = `You are perfectly optimizing your contributions! You will hit the IRS limit while capturing every dollar of agency match.`;
  }

  let currentStrategyWarning = null;
  let currentStrategyWarningIcon = "⚠️";
  if (lostMatchAmount > 0) {
    if (currentRate < 5) {
      currentStrategyWarning = `Your rate is below 5%. You are leaving $${lostMatchAmount.toFixed(2)} in free agency matching on the table over the remaining ${remainingPayPeriods} pay period(s)!`;
    } else if (periodsWithLostMatch > 0) {
      currentStrategyWarning = `This rate hits your IRS limit early! You cap out at $${maxAnnualContribution.toFixed(2)} and leave $${lostMatchAmount.toFixed(2)} in matching on the table across ${periodsWithLostMatch} pay period(s) at the end of the year.`;
    }
  } else if (totalCurrentContribution < maxAnnualContribution - 0.01) {
    currentStrategyWarning = `You are projected to contribute $${totalCurrentContribution.toFixed(2)} by the end of the year. You are leaving $${(maxAnnualContribution - totalCurrentContribution).toFixed(2)} of tax-advantaged space unused!`;
    currentStrategyWarningIcon = "💡";
  }

  return (
    <div className="app-container">
      <header className="hero">
        <h1>TSP Maximizer</h1>
        <p>Optimize your Thrift Savings Plan to hit the max limit precisely while capturing every dollar of agency match.</p>
        <button className="reset-btn" onClick={handleReset}>Reset to Defaults</button>
      </header>
      
      <main className="dashboard">
        <section className="card form-section">
          <div className="section-header">
            <h2>Financial Details</h2>
          </div>
          <div className="input-grid">
            <div className="input-group">
              <label>Base Pay ($/month)</label>
              <input 
                type="number" 
                step="0.01"
                value={basePayInput} 
                onChange={e => setBasePayInput(e.target.value)} 
                onBlur={e => handleMoneyBlur(setBasePayInput, e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Contributed So Far ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={contributedSoFarInput} 
                onChange={e => setContributedSoFarInput(e.target.value)} 
                onBlur={e => handleMoneyBlur(setContributedSoFarInput, e.target.value)}
              />
            </div>
            <div className="input-group slider-group" style={{ marginBottom: '1rem' }}>
              <div className="slider-label" style={{ marginBottom: '1rem', alignItems: 'center' }}>
                <span>Contribution Rate</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="slider-value-input"
                    value={currentRateStr}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val === '') { setCurrentRateStr(''); return; }
                      const num = parseInt(val, 10);
                      if (num > 100) setCurrentRateStr('100');
                      else setCurrentRateStr(val);
                    }}
                    onBlur={() => {
                      const num = parseInt(currentRateStr, 10);
                      if (isNaN(num) || num < 0) setCurrentRateStr('0');
                      else if (num > 100) setCurrentRateStr('100');
                      else setCurrentRateStr(num.toString());
                    }}
                  />
                  <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-color)' }}>%</span>
                </div>
              </div>
              
              <div className="slider-container" style={{ position: 'relative', width: '100%' }}>
                <div className="slider-track-wrapper">
                  <div className="slider-track-fill" style={{ width: getSliderOffset(currentRate) }}></div>
                  {[0, 25, 50, 75, 100].map(val => (
                    <div 
                      key={val} 
                      className={`slider-node ${currentRate >= val ? 'active' : ''}`}
                      style={{ left: getSliderOffset(val) }}
                    ></div>
                  ))}
                </div>
                <input 
                  type="range" 
                  className="custom-slider"
                  min="0" 
                  max="100" 
                  step="1"
                  value={currentRate} 
                  onChange={e => setCurrentRateStr(e.target.value)}
                />
              </div>

              <div className="slider-ticks-container">
                <span style={{ left: getSliderOffset(0) }}>0</span>
                <span style={{ left: getSliderOffset(25) }}>25</span>
                <span style={{ left: getSliderOffset(50) }}>50</span>
                <span style={{ left: getSliderOffset(75) }}>75</span>
                <span style={{ left: getSliderOffset(100) }}>100</span>
              </div>
            </div>
            <div className="input-group">
              <label>Agency Auto So Far ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={agencyAutoSoFarInput} 
                onChange={e => setAgencyAutoSoFarInput(e.target.value)} 
                onBlur={e => handleMoneyBlur(setAgencyAutoSoFarInput, e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Agency Match So Far ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={agencyMatchSoFarInput} 
                onChange={e => setAgencyMatchSoFarInput(e.target.value)} 
                onBlur={e => handleMoneyBlur(setAgencyMatchSoFarInput, e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Max Annual Contribution ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={maxAnnualContributionInput} 
                onChange={e => setMaxAnnualContributionInput(e.target.value)} 
                onBlur={e => handleMoneyBlur(setMaxAnnualContributionInput, e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Total Pay Periods</label>
              <input type="number" value={totalPayPeriods} onChange={e => setTotalPayPeriods(Number(e.target.value))} />
            </div>
            <div className="input-group slider-group" style={{ marginBottom: '1rem' }}>
              <div className="slider-label" style={{ marginBottom: '1rem' }}>
                <span>Current Pay Period</span>
                <span className="slider-value" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.2rem', width: '250px' }}>
                  <span style={{ display: 'inline-block', width: '3ch', textAlign: 'right' }}>{currentPeriod}</span>
                  <span>of</span>
                  <span style={{ display: 'inline-block', width: '3ch', textAlign: 'right' }}>{totalPayPeriods}</span>
                  <span style={{ marginLeft: '0.2rem' }}>(Remaining:</span>
                  <span style={{ display: 'inline-block', width: '3ch', textAlign: 'right' }}>{remainingPayPeriods}</span>
                  <span>)</span>
                </span>
              </div>
              <div className="slider-container" style={{ position: 'relative', width: '100%' }}>
                <div className="slider-track-wrapper">
                  <div className="slider-track-fill" style={{ width: getSliderOffset(currentPeriod > 0 ? (currentPeriod / totalPayPeriods) * 100 : 0) }}></div>
                  {Array.from({ length: totalPayPeriods + 1 }).map((_, i) => {
                    const percent = (i / totalPayPeriods) * 100;
                    return (
                      <div 
                        key={i} 
                        className={`slider-node ${currentPeriod >= i ? 'active' : ''}`}
                        style={{ left: getSliderOffset(percent) }}
                      ></div>
                    );
                  })}
                </div>
                <input 
                  type="range" 
                  className="custom-slider"
                  min="0" 
                  max={totalPayPeriods} 
                  value={currentPeriod} 
                  onChange={e => setCurrentPeriod(Number(e.target.value))} 
                />
              </div>
              <div className="slider-ticks-container">
                {Array.from({ length: totalPayPeriods + 1 }).map((_, i) => (
                  <span key={i} style={{ left: getSliderOffset((i / totalPayPeriods) * 100) }}>{i}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="results-column">
          <section className="card results-section current-strategy">
            <h2>Current Strategy</h2>
            <div className="results-grid">
              <div className="stat-box highlight-secondary">
                <span className="stat-label">Current Contribution Rate</span>
                <span className="stat-value">{Math.round(currentRate)}%</span>
                <span className="stat-sub tooltip-wrapper">
                  What does this mean? 
                  <span className="tooltip-icon">ⓘ</span>
                  <div className="tooltip-content">{currentStrategyTooltip}</div>
                </span>
              </div>
              
              <div className="stat-box">
                <span className="stat-label">Projected End-of-Year Value</span>
                <span className="stat-value">${totalCurrentValue.toFixed(2)}</span>
                <div className="breakdown">
                  <div className="breakdown-item">
                    <span>Your Contribution:</span>
                    <span>${totalCurrentContribution.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Agency Match (up to {maxMatchPercent}%):</span>
                    <span>${totalCurrentMatch.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Agency Auto ({autoContributionPercent}%):</span>
                    <span>${totalAuto.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ minHeight: '90px', marginTop: '1.5rem' }}>
              {currentStrategyWarning && (
                 <div className="alert-warning" style={{ marginTop: 0 }}>
                   <span className="alert-icon">{currentStrategyWarningIcon}</span>
                   {currentStrategyWarning}
                 </div>
              )}
            </div>
          </section>

          <section className="card results-section optimal-strategy">
            <h2>Optimal Strategy</h2>
            <div className="results-grid">
              <div className="stat-box highlight">
                <span className="stat-label">Optimal Contribution Rate</span>
                <span className="stat-value">{optimalContributionRate}%</span>
                <span className="stat-sub">Integer rate to safely max out IRS limit</span>
              </div>
              
              <div className="stat-box">
                <span className="stat-label">Projected End-of-Year Value</span>
                <span className="stat-value">${totalOptimalValue.toFixed(2)}</span>
                <div className="breakdown">
                  <div className="breakdown-item">
                    <span>Your Contribution:</span>
                    <span>${totalOptimalContribution.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Agency Match (up to {maxMatchPercent}%):</span>
                    <span>${totalOptimalMatch.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Agency Auto ({autoContributionPercent}%):</span>
                    <span>${totalOptimalAuto.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ minHeight: '90px', marginTop: '1.5rem' }}>
              {willLoseMatch && (
                 <div className="alert-warning" style={{ marginTop: 0 }}>
                   <span className="alert-icon">⚠️</span>
                   This integer optimal rate causes you to leave ${optStrategyLostMatch.toFixed(2)} in free agency matching on the table!
                 </div>
              )}
            </div>
          </section>

          <section className="card results-section min-match-strategy">
            <h2>Capture the Max Match</h2>
            <div className="results-grid">
              <div className="stat-box highlight-tertiary" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                <span className="stat-label">Minimum Target Rate</span>
                <span className="stat-value" style={{ color: '#8b5cf6' }}>5%</span>
                <span className="stat-sub">Lowest rate to secure 100% of the agency match</span>
              </div>
              
              <div className="stat-box">
                <span className="stat-label">Projected End-of-Year Value</span>
                <span className="stat-value">${totalMinValue.toFixed(2)}</span>
                <div className="breakdown">
                  <div className="breakdown-item">
                    <span>Your Contribution:</span>
                    <span>${totalMinContrib.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Agency Match (up to {maxMatchPercent}%):</span>
                    <span>${totalMinMatch.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Agency Auto ({autoContributionPercent}%):</span>
                    <span>${totalMinAuto.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ minHeight: '90px', marginTop: '1.5rem' }}>
              {totalMinContrib < maxAnnualContribution - 0.01 && (
                 <div className="alert-warning" style={{ marginTop: 0 }}>
                   <span className="alert-icon">💡</span>
                   This strategy minimizes the hit to your paycheck while capturing all free matching money. However, you leave ${(maxAnnualContribution - totalMinContrib).toFixed(2)} of tax-advantaged IRS space unused!
                 </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
