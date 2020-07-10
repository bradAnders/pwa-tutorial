// offline data
db.enablePersistence()
  .catch(err => {
    if (err.code ==='failed-precondition') {
      // Probably multilpe tabs open at once
      console.log('persistence failed');
    } else if (err.code === 'unimplemented') {
      // Lack of browser support
      console.log('persistence is not available');
    }
  });

// Real time listener
db.collection('recipes').onSnapshot(snapshot => {
  // console.log(snapshot.docChanges());
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added') {
      renderRecipe(change.doc.data(), change.doc.id);
    } else {
      removeRecipe(change.doc.id);
    }
  })
});

// add new recipie
const form = document.querySelector('form');
form.addEventListener('submit', e => {
  e.preventDefault();

  const recipe = {
    title: form.title.value,
    ingredients: form.ingredients.value
  };

  db.collection('recipes').add(recipe)
    .catch(err => console.log(err));

  form.reset();

})

// Remove recipe
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', e => {
  if (e.target.tagName === "I") {
    db.collection('recipes').doc(e.target.getAttribute('data-id')).delete();
  }
});
