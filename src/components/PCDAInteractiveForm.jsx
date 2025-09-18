import React, { useMemo, useState } from 'react'
import schools from '../data/schools.json'
import { downloadCSV, downloadPDF } from '../utils/export'

const currency = (n) =>
  (isNaN(n) ? 0 : n).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

const desiredLevels = ['NCAA DI', 'NCAA DII', 'NCAA DIII', 'NAIA']
const residencyOptions = [
  { label: 'Citizen', value: 'citizen' },
  { label: 'Permanent Resident', value: 'pr' },
  { label: 'Visa Holder', value: 'visa' },
  { label: 'Other', value: 'other' },
]

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-2xl shadow p-6 border border-zinc-200" id={title.replace(/\s+/g,'-').toLowerCase()}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </section>
  )
}
function Divider() { return <div className="h-px bg-zinc-200 my-6" /> }
function Tag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-zinc-100 border border-zinc-300 text-zinc-800 rounded-full px-3 py-1 text-sm mr-2 mb-2">
      {label}
      {onRemove && (
        <button className="ml-1 text-zinc-500 hover:text-zinc-800" onClick={onRemove} aria-label={\`Remove \${label}\`}>&times;</button>
      )}
    </span>
  )
}

function Timeline({ credits }) {
  const gapEligible = credits <= 22
  const redshirt = credits >= 24
  return (
    <div className="mt-3">
      <svg viewBox="0 0 600 70" className="w-full h-16">
        <line x1="20" y1="35" x2="580" y2="35" stroke="#d4d4d8" strokeWidth="6" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={30 + i * 110} y={20} width={100} height={30} rx={6} fill="#e5e7eb" />
        ))}
        {gapEligible && (<rect x={30} y={20} width={100} height={30} rx={6} fill="#c7d2fe" />)}
        {redshirt && (<rect x={30} y={20} width={100} height={30} rx={6} fill="#fecaca" />)}
        <text x={300} y={65} textAnchor="middle" fontSize="12" fill="#52525b">Five-Year Eligibility Window</text>
        {gapEligible && (<text x={80} y={15} textAnchor="middle" fontSize="12" fill="#0b5cab">GAP Year Utilizable</text>)}
        {redshirt && (<text x={80} y={15} textAnchor="middle" fontSize="12" fill="#7f1d1d">Redshirt Year Utilized</text>)}
      </svg>
    </div>
  )
}

function MultiSelect({ options, value, onChange, placeholder = 'Search schools...' }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(term) ||
        (o.level || '').toLowerCase().includes(term) ||
        (o.location || '').toLowerCase().includes(term)
    )
  }, [q, options])

  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id))
    else onChange([...value, id])
  }
  const remove = (id) => onChange(value.filter((v) => v !== id))

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pcdaPrimary"
      />
      <div className="mt-2 flex flex-wrap">
        {value.map((id) => {
          const item = options.find((o) => o.id === id)
          if (!item) return null
          return <Tag key={id} label={item.name} onRemove={() => remove(id)} />
        })}
      </div>
      <div className="max-h-48 overflow-auto mt-2 border rounded-xl border-zinc-200 divide-y">
        {filtered.map((o) => (
          <label key={o.id} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-zinc-50 cursor-pointer">
            <input type="checkbox" className="size-4" checked={value.includes(o.id)} onChange={() => toggle(o.id)} />
            <div className="flex-1">
              <div className="font-medium">{o.name}</div>
              <div className="text-xs text-zinc-500">{o.level} • {o.location}</div>
            </div>
          </label>
        ))}
        {filtered.length === 0 && (<div className="px-3 py-4 text-sm text-zinc-500">No matches.</div>)}
      </div>
    </div>
  )
}

function DataRow({ label, children }) {
  return (
    <div className="grid grid-cols-12 gap-3 items-center">
      <div className="col-span-5 md:col-span-4 text-sm text-zinc-600">{label}</div>
      <div className="col-span-7 md:col-span-8">{children}</div>
    </div>
  )
}

function SchoolCard({ school }) {
  return (
    <div className="border rounded-2xl p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{school.name}</h4>
        <span className="text-xs px-2 py-1 rounded-full" style={{background:'#eef8fd', border:'1px solid #d3eefb', color:'#0369a1'}}>{school.level}</span>
      </div>
      <div className="text-sm text-zinc-600 mt-1">{school.location}</div>
      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-zinc-500">Estimated Cost of Attendance</div>
          <div className="font-medium">{currency(school.cost)}</div>
        </div>
        <div>
          <div className="text-zinc-500">Average Class Size</div>
          <div className="font-medium">{school.avgClassSize}</div>
        </div>
      </div>
      <div className="mt-3 text-sm">
        <div className="text-zinc-500 mb-1">Previous 2 Years College Soccer Record</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(school.records || {}).map(([season, rec]) => (
            <div key={season} className="border rounded-xl p-2">
              <div className="text-xs text-zinc-500">{season}</div>
              <div className="font-medium">{rec}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PathwayTable({ variant, visitDate1, setVisitDate1, visitDate2, setVisitDate2, timestamp }) {
  const base = [
    ['Semester 1: Fall 202X', [
      'Complete PCDA Enrollment Paperwork',
      'Attend Initial Player Assessment',
      'Begin Academic Advising Sessions',
      'Start Strength & Conditioning Program',
      'Participate in Team Training Sessions',
      'Research College Programs from Selected List',
      `Schedule First College Visit (Potential Visit Date: ${visitDate1 || 'TBD'})`,
      'Work with PCDA Recruiting Coordinator to create highlight reel',
      'Begin Communication with College Coaches',
      'Continue Academic Support',
      'Mid-Semester Progress Review',
      'End of Semester 1 Assessment',
    ]],
    ['Semester 2: Spring 202Y', [
      'Focus on NCAA/NAIA Eligibility Requirements',
      'Intensify College Application Process',
      `Schedule Second College Visit (Potential Visit Date: ${visitDate2 || 'TBD'})`,
      'Continue Advanced Training and Scrimmages',
      'Prepare for Standardized Tests (SAT/ACT)',
      'Finalize College Applications',
      'Attend College Showcases/Combines',
      'Receive College Offers',
      'Commit to a College Program',
      'PCDA Graduation and Transition Planning',
    ]],
  ]

  const extended = [
    ['Semester 1: Fall 202X', [
      'Complete PCDA Enrollment Paperwork',
      'Initial Player Assessment & Baseline Testing',
      'Academic Advising & Study Plan',
      'Intro Strength & Conditioning',
      'Team Training Fundamentals',
      'Deep Research on College Programs',
    ]],
    ['Semester 2: Spring/Summer 202Y', [
      `Schedule First College Visit (Potential Visit Date: ${visitDate1 || 'TBD'})`,
      'Create/Refine Highlight Reel',
      'Coach Outreach Prep & Messaging',
      'Advanced Training & Position-Specific Work',
      'SAT/ACT Prep & Practice Tests',
    ]],
    ['Semester 3: Fall 202Y', [
      'Active Communication with College Coaches',
      `Schedule Second College Visit (Potential Visit Date: ${visitDate2 || 'TBD'})`,
      'Applications Finalization',
      'Attend Showcases/Combines',
      'Evaluate Offers & Commit',
      'PCDA Graduation and Transition Planning',
    ]],
  ]

  const plan = variant === '3' ? extended : base

  return (
    <div className="mt-4">
      <div className="text-xs text-zinc-500 mb-2">Generated: {timestamp}</div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="text-sm text-zinc-700">Input Date for Potential Visit #1</label>
          <input type="date" value={visitDate1 || ''} onChange={(e) => setVisitDate1(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm mt-1" />
        </div>
        <div className="col-span-1">
          <label className="text-sm text-zinc-700">Input Date for Potential Visit #2</label>
          <input type="date" value={visitDate2 || ''} onChange={(e) => setVisitDate2(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm mt-1" />
        </div>
      </div>

      <div className="mt-4 space-y-6">
        {plan.map(([title, items]) => (
          <div key={title} className="border rounded-2xl p-4 bg-white shadow-sm">
            <div className="font-semibold mb-2">{title}</div>
            <ul className="list-disc ml-5 space-y-1">
              {items.map((it, idx) => (<li key={idx} className="text-sm">{it}</li>))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PCDAInteractiveForm() {
  // I. Intro
  const [gpa, setGpa] = useState('')
  const [collegeClasses, setCollegeClasses] = useState('')

  // II. Questionnaire
  const [desiredLevel, setDesiredLevel] = useState('')
  const [eligibilityAwareness, setEligibilityAwareness] = useState('No')
  const [residency, setResidency] = useState('citizen')
  const fafsaEligible = useMemo(() => !(residency === 'visa' || residency === 'other'), [residency])
  const [creditsTaken, setCreditsTaken] = useState(0)

  // Schools
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([])
  const selectedSchools = useMemo(() => schools.filter((s) => selectedSchoolIds.includes(s.id)), [selectedSchoolIds])

  // IV. Financials
  const TOTAL_FEE = 31750
  const [downPayment, setDownPayment] = useState(0)
  const [fafsaReduction, setFafsaReduction] = useState(0) // editable placeholder if eligible; auto 0 if not
  const [hoursPerWeek, setHoursPerWeek] = useState(0)
  const [reductionPerSemester, setReductionPerSemester] = useState(0)
  const [semesters, setSemesters] = useState('2') // '2' or '3'
  const workReductionTotal = useMemo(() => {
    const semCount = semesters === '3' ? 3 : 2
    return Number(reductionPerSemester || 0) * semCount
  }, [reductionPerSemester, semesters])
  const computedFafsa = fafsaEligible ? Number(fafsaReduction || 0) : 0
  const netRemaining = useMemo(() => {
    const base = TOTAL_FEE - Number(downPayment || 0) - computedFafsa - Number(workReductionTotal || 0)
    return Math.max(base, 0)
  }, [TOTAL_FEE, downPayment, computedFafsa, workReductionTotal])

  // V. Pathway
  const [visitDate1, setVisitDate1] = useState('')
  const [visitDate2, setVisitDate2] = useState('')
  const [pathwayTimestamp, setPathwayTimestamp] = useState('')
  const generatePathway = () => setPathwayTimestamp(new Date().toLocaleString())

  // Export helpers
  const exportCSV = () => {
    const rows = []
    const push = (Field, Value) => rows.push({ Field, Value })
    push('GPA', gpa)
    push('College Classes', collegeClasses)
    push('Residency', residency)
    push('FAFSA Eligible', fafsaEligible ? 'Yes' : 'No')
    push('Credits Taken', creditsTaken)
    push('Desired Level', desiredLevel)
    push('Down Payment', downPayment)
    push('FAFSA Reduction', computedFafsa)
    push('Work Reduction (Total)', workReductionTotal)
    push('Net Remaining Balance', netRemaining)
    push('Pathway Length', semesters)
    push('Visit Date #1', visitDate1 || 'TBD')
    push('Visit Date #2', visitDate2 || 'TBD')
    push('Selected Schools', selectedSchools.map(s => s.name).join('; '))
    downloadCSV(rows)
  }
  const exportPDF = () => downloadPDF('pcda-summary')

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/pcda-logo.png" alt="PCDA" className="w-9 h-9 rounded-2xl" />
            <div>
              <div className="font-semibold">PCDA Interactive Presentation</div>
              <div className="text-xs text-zinc-500">Prospective Student-Athlete Session</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="text-sm px-3 py-1.5 rounded-xl border bg-white hover:bg-zinc-50">
              Print / Save PDF
            </button>
            <button onClick={exportCSV} className="text-sm px-3 py-1.5 rounded-xl" style={{background:'#26a8e0', color:'white'}}>Download CSV</button>
            <button onClick={exportPDF} className="text-sm px-3 py-1.5 rounded-xl border" style={{borderColor:'#26a8e0', color:'#026aa7'}}>Download PDF</button>
          </div>
        </div>
      </header>

      <main id="pcda-summary" className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <Section title="I. Introduction & Welcome">
          <div className="text-sm text-zinc-700 leading-relaxed">
            <p className="mb-2">
              Welcome to PCDA! In this live session, we’ll gather your academic and athletic info, review eligibility,
              explore your target colleges, walk through program costs, and generate a personalized pathway for your success.
            </p>
            <ul className="list-disc ml-6">
              <li>Recruit profile collection</li>
              <li>Academic eligibility visual calculator</li>
              <li>College list insights</li>
              <li>Financial overview & net balance</li>
              <li>Personalized 2- or 3-semester journey with action items</li>
            </ul>
          </div>
        </Section>

        <Section title="II. Interactive Questionnaire">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">A. Recruit Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <DataRow label="Current High School GPA">
                  <input type="number" step="0.01" min="0" max="4" value={gpa} onChange={(e) => setGpa(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" />
                </DataRow>
                <DataRow label="Number of Current College Classes">
                  <input type="number" min="0" value={collegeClasses} onChange={(e) => setCollegeClasses(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" />
                </DataRow>
              </div>
            </div>

            <Divider />

            <div>
              <h3 className="font-semibold mb-3">B. College Aspirations</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm text-zinc-700 mb-1 block">Desired List of Schools (search & multi-select)</label>
                  <MultiSelect options={schools} value={selectedSchoolIds} onChange={setSelectedSchoolIds} />
                </div>
                <div>
                  <label className="text-sm text-zinc-700">Desired Level of College Soccer</label>
                  <select value={desiredLevel} onChange={(e) => setDesiredLevel(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm mt-1">
                    <option value="">Select...</option>
                    {desiredLevels.map((lvl) => (<option key={lvl} value={lvl}>{lvl}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-700">Do you know if you’re academically eligible?</label>
                  <div className="mt-1 flex items-center gap-6 text-sm">
                    {[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }].map((o) => (
                      <label key={o.value} className="inline-flex items-center gap-2">
                        <input type="radio" name="eligAware" checked={eligibilityAwareness === o.value} onChange={() => setEligibilityAwareness(o.value)} />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            <div>
              <h3 className="font-semibold mb-3">C. Residency & FAFSA Eligibility</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-zinc-700">Residency Status</label>
                  <select value={residency} onChange={(e) => setResidency(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm mt-1">
                    {residencyOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <div className="text-sm text-zinc-700 mb-1">FAFSA Eligibility (auto)</div>
                  <div className={\`rounded-xl border px-3 py-2 text-sm \${fafsaEligible ? 'bg-green-50 border-green-200 text-green-800' : 'bg-rose-50 border-rose-200 text-rose-800'}\`}>
                    {fafsaEligible ? 'FAFSA Eligible' : 'FAFSA Ineligible'}
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            <div>
              <h3 className="font-semibold mb-3">D. College Eligibility Calculator (Visual Aid)</h3>
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div>
                  <label className="text-sm text-zinc-700">Credits Taken</label>
                  <input type="number" min="0" value={creditsTaken} onChange={(e) => setCreditsTaken(Number(e.target.value || 0))} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm mt-1" />
                  <div className="mt-2 text-sm">
                    {creditsTaken <= 22 && (<div className="text-sky-900 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">You still have 5 years of eligibility, and we can utilize your GAP year effectively.</div>)}
                    {creditsTaken >= 24 && (<div className="text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">Your eligibility clock has started, and we will utilize your red shirt year.</div>)}
                  </div>
                </div>
                <div><Timeline credits={creditsTaken} /></div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="III. College Selection & Data Display">
          {selectedSchools.length === 0 ? (
            <div className="text-sm text-zinc-500">Select one or more schools above to see details.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">{selectedSchools.map((s) => (<SchoolCard key={s.id} school={s} />))}</div>
          )}
        </Section>

        <Section title="IV. Financial Commitment Overview & Calculator">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">A. PCDA Program Fees</h4>
              <div className="text-sm">Starting Fee: <span className="font-medium">{currency(TOTAL_FEE)}</span></div>
              <div className="mt-2">
                <label className="text-sm text-zinc-700">Flexible Down Payment</label>
                <input type="number" min="0" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value || 0))} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm mt-1" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">B. Financial Calculator Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Program Fee</span><span className="font-medium">{currency(TOTAL_FEE)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less: Flexible Down Payment</span><span className="font-medium">-{currency(Number(downPayment || 0))}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span>Potential FAFSA Reduction</span><span className="font-medium">-{currency(computedFafsa)}</span>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <input type="number" min="0" disabled={!fafsaEligible} placeholder={fafsaEligible ? 'Enter grant estimate' : 'Ineligible'} value={fafsaEligible ? fafsaReduction : 0} onChange={(e) => setFafsaReduction(Number(e.target.value || 0))} className={\`w-full rounded-xl border px-3 py-2 text-sm \${fafsaEligible ? 'border-zinc-300' : 'border-zinc-200 bg-zinc-100 text-zinc-500'}\`} />
                    <div className="text-xs text-zinc-500 flex items-center">Based on residency status above</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span>Potential Work Opportunity Reduction</span><span className="font-medium">-{currency(workReductionTotal)}</span>
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-2 items-center">
                    <div>
                      <label className="text-xs text-zinc-600">X hours/week</label>
                      <input type="number" min="0" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value || 0))} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-zinc-600">$Y reduction per semester</label>
                      <input type="number" min="0" value={reductionPerSemester} onChange={(e) => setReductionPerSemester(Number(e.target.value || 0))} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-2 flex justify-between text-base">
                  <span className="font-medium">Net Remaining Balance</span><span className="font-semibold">{currency(netRemaining)}</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="V. Personalized PCDA Journey Pathway">
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm text-zinc-700">Pathway Length</label>
              <select value={semesters} onChange={(e) => setSemesters(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm mt-1">
                <option value="2">2 Semesters</option>
                <option value="3">3 Semesters</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button onClick={generatePathway} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{background:'#26a8e0'}}>Generate / Refresh Pathway</button>
              <div className="text-xs text-zinc-500 self-center">Adds a timestamp and uses your visit dates in the action items</div>
            </div>
          </div>
          <PathwayTable variant={semesters} visitDate1={visitDate1} setVisitDate1={setVisitDate1} visitDate2={visitDate2} setVisitDate2={setVisitDate2} timestamp={pathwayTimestamp} />
        </Section>

        <div className="text-xs text-zinc-500 text-center py-6">
          Prototype — replace or expand schools.json with your full NCAA/NAIA database. All figures shown are for demonstration only.
        </div>
      </main>
    </div>
  )
}
