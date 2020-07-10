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
      // Remove the document data from the web page
    }
  })
});
