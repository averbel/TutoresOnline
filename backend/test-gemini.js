async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyC4qYFl7cRk1z8l1CjnZeRqbzwSb0TizcU`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const txtModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).map(m => m.name);
    console.log(txtModels);
  } catch (error) {
    console.error(error);
  }
}
listModels();
