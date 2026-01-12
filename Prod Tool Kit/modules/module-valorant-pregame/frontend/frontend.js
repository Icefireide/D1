async function initUI() {
  const server = await window.constants.getModuleURL()
  const location = `${server}/gfx`

  const apiKey = await window.constants.getApiKey()

  document.querySelector(
    '#loading-embed'
  ).value = `${location}/loading/index.html${
    apiKey !== null ? '?apikey=' + apiKey : ''
  }`
  document.querySelector(
    '#loading-gfx'
  ).value = `${location}/loading/index.html${
    apiKey !== null ? '?apikey=' + apiKey : ''
  }`

  document.querySelector(
    '#pregame-embed'
  ).value = `${location}/pregame/index.html${
    apiKey !== null ? '?apikey=' + apiKey : ''
  }`
  document.querySelector('#pregame-gfx').src = `${location}/pregame/index.html${
    apiKey !== null ? '?apikey=' + apiKey : ''
  }`
}
initUI()
