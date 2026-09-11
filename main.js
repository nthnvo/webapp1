import './style.css'

const TIP_PRESETS = [0, 10, 15, 20]

const state = {
  bill: '',
  tipPreset: 10,
  customTip: '',
  people: 2,
}

let prevValues = { tip: 0, total: 0, perPerson: 0 }

document.querySelector('#app').innerHTML = `
  <div class="card">
    <div class="app-header">
      <h1 class="app-title">หารบิลค่าอาหาร</h1>
      <p class="app-subtitle">คำนวณทิปและยอดที่แต่ละคนต้องจ่าย</p>
    </div>

    <div class="section">
      <label class="section-label" for="bill">ยอดบิลรวม (บาท)</label>
      <div class="bill-input-wrap">
        <span class="bill-currency">฿</span>
        <input
          id="bill"
          class="bill-input"
          type="number"
          inputmode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          autocomplete="off"
        />
      </div>
    </div>

    <div class="section">
      <label class="section-label">เปอร์เซ็นต์ทิป</label>
      <div class="tip-buttons" id="tipButtons"></div>
      <div class="tip-custom-wrap">
        <input
          id="customTip"
          class="tip-custom"
          type="number"
          inputmode="decimal"
          min="0"
          max="100"
          step="0.5"
          placeholder="หรือกรอกเปอร์เซ็นต์เอง"
          autocomplete="off"
        />
        <span class="tip-custom-sign">%</span>
      </div>
    </div>

    <div class="section">
      <label class="section-label">จำนวนคน</label>
      <div class="people-row">
        <button class="people-btn" id="peopleMinus" type="button" aria-label="ลดจำนวนคน">−</button>
        <div class="people-display" id="peopleDisplay">2</div>
        <button class="people-btn" id="peoplePlus" type="button" aria-label="เพิ่มจำนวนคน">+</button>
      </div>
    </div>

    <div class="results empty" id="results">
      <div class="result-row">
        <span class="result-label">ยอดทิปรวม</span>
        <span class="result-value" id="tipValue">฿0.00</span>
      </div>
      <div class="result-row">
        <span class="result-label">ยอดรวมทั้งหมด</span>
        <span class="result-value" id="totalValue">฿0.00</span>
      </div>
      <div class="result-row per-person">
        <span class="result-label">แต่ละคนจ่าย</span>
        <span class="result-value" id="perPersonValue">฿0.00</span>
      </div>
    </div>

    <button class="reset-btn" id="resetBtn" type="button">รีเซ็ต</button>
  </div>
`

const billInput = document.querySelector('#bill')
const tipButtonsEl = document.querySelector('#tipButtons')
const customTipInput = document.querySelector('#customTip')
const peopleDisplay = document.querySelector('#peopleDisplay')
const peopleMinusBtn = document.querySelector('#peopleMinus')
const peoplePlusBtn = document.querySelector('#peoplePlus')
const resultsEl = document.querySelector('#results')
const tipValueEl = document.querySelector('#tipValue')
const totalValueEl = document.querySelector('#totalValue')
const perPersonValueEl = document.querySelector('#perPersonValue')
const resetBtn = document.querySelector('#resetBtn')

function renderTipButtons() {
  tipButtonsEl.innerHTML = TIP_PRESETS.map(
    (p) =>
      `<button class="tip-btn${p === state.tipPreset ? ' active' : ''}" data-tip="${p}" type="button">${p}%</button>`,
  ).join('')
}

function getActiveTipPercent() {
  if (customTipInput.value !== '') {
    const v = parseFloat(customTipInput.value)
    return isNaN(v) ? 0 : v
  }
  return state.tipPreset
}

function getBillAmount() {
  const v = parseFloat(billInput.value)
  return isNaN(v) || v < 0 ? 0 : v
}

function formatBaht(amount) {
  return '฿' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function popValue(el) {
  el.classList.remove('pop')
  void el.offsetWidth
  el.classList.add('pop')
}

function updateResults() {
  const bill = getBillAmount()
  const tipPercent = getActiveTipPercent()
  const people = state.people

  const tip = bill * (tipPercent / 100)
  const total = bill + tip
  const perPerson = people > 0 ? total / people : 0

  const hasInput = bill > 0

  resultsEl.classList.toggle('empty', !hasInput)

  tipValueEl.textContent = formatBaht(tip)
  totalValueEl.textContent = formatBaht(total)
  perPersonValueEl.textContent = formatBaht(perPerson)

  if (hasInput) {
    if (tip !== prevValues.tip) popValue(tipValueEl)
    if (total !== prevValues.total) popValue(totalValueEl)
    if (perPerson !== prevValues.perPerson) popValue(perPersonValueEl)
  }

  prevValues = { tip, total, perPerson }
}

function setPeople(value) {
  state.people = Math.max(1, Math.min(99, value))
  peopleDisplay.textContent = state.people
  peopleMinusBtn.disabled = state.people <= 1
  updateResults()
}

billInput.addEventListener('input', () => {
  if (billInput.value !== '' && parseFloat(billInput.value) < 0) {
    billInput.value = ''
  }
  updateResults()
})

tipButtonsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.tip-btn')
  if (!btn) return
  state.tipPreset = parseFloat(btn.dataset.tip)
  customTipInput.value = ''
  renderTipButtons()
  updateResults()
})

customTipInput.addEventListener('input', () => {
  const v = parseFloat(customTipInput.value)
  if (!isNaN(v) && TIP_PRESETS.includes(v)) {
    state.tipPreset = v
    renderTipButtons()
  } else {
    state.tipPreset = -1
    renderTipButtons()
  }
  updateResults()
})

peopleMinusBtn.addEventListener('click', () => setPeople(state.people - 1))
peoplePlusBtn.addEventListener('click', () => setPeople(state.people + 1))

resetBtn.addEventListener('click', () => {
  billInput.value = ''
  customTipInput.value = ''
  state.tipPreset = 10
  state.customTip = ''
  renderTipButtons()
  setPeople(2)
  billInput.focus()
})

renderTipButtons()
setPeople(2)
updateResults()
