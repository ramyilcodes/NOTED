let allNotes = [];
let personalNotes = [];

const noteContainer = document.getElementById("noteContainer");
const pageType = noteContainer?.dataset.page;

fetch("../scripts/notes.json")
  .then((res) => res.json())
  .then((data) => {
    allNotes = data.notes;

    personalNotes = data.notes.filter((note) => note.type === "personal");

    // render personal notes
    if (pageType === "personal") {
      renderNotes(personalNotes);
    }

    else{
        renderNotes(allNotes);
    }
  })
  .catch((error) => console.error("Error loading notes:", error));

  
// render notes
function renderNotes(notes) {
  noteContainer.innerHTML = "";

  if (!notes || notes.length === 0) {
    noteContainer.innerHTML = "<p>No notes found.</p>";
    return;
  }

  notes.forEach((note) => {
    const card = document.createElement("article");
    card.classList.add("note");

    card.innerHTML = `
      <figure>
        <img src="../assets/default-pfp.svg" alt="" loading="lazy" />
      </figure>

      <div class="note_content flex flex-col gap-2">
        <h3 class="note__author">${note.author}</h3>
        <p class="note__text">${note.text}</p>

        ${renderImages(note.images)}
      </div>
    `;

    noteContainer.appendChild(card);
  });
}

// render images
function renderImages(images = []) {
  // Remove empty strings
  const validImages = images.filter(
    (img) => typeof img === "string" && img.trim() !== "",
  );

  // If no valid images, render nothing
  if (validImages.length === 0) return "";

  // Generate image markup
  return `
    <figure class="note_attachment">
      ${validImages
        .map(
          (img, index) => `
            <img
              src="${img}"
              alt="Note image ${index + 1}"
              loading="lazy"
            />
          `,
        )
        .join("")}
    </figure>
  `;
}
