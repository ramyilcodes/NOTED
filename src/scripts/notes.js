import { authService } from "./auth.js";
import { db, NOTES_STORE } from "./db.js";
import { showFormError, clearFormError } from "./form.js";

function createNoteId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

class NotesService {
  async fetchNotes({ type, authorEmail } = {}) {
    if (authorEmail) {
      const notes = await db.queryByIndex(
        NOTES_STORE,
        "authorEmail",
        authorEmail,
      );
      return type ? notes.filter((n) => n.type === type) : notes;
    }
    if (type) {
      return db.queryByIndex(NOTES_STORE, "type", type);
    }
    return db.getAll(NOTES_STORE);
  }

  async createNote({ text, images = [], type }) {
    const trimmedText = typeof text === "string" ? text.trim() : text;

    if (!trimmedText) {
      return {
        success: false,
        error: "Note text is required",
      };
    }

    const safeType = type === "personal" ? "personal" : "public";

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: "User must be logged in",
      };
    }

    const note = {
      id: createNoteId(),
      text: trimmedText,
      author: {
        name: currentUser.fullName || currentUser.email,
        email: currentUser.email,
      },
      images: Array.isArray(images) ? images : [],
      type: safeType,
      createdAt: Date.now(),
    };

    await db.put(NOTES_STORE, note);

    return {
      success: true,
      note,
    };
  }

  async deleteNote(id) {
    if (!id) {
      return {
        success: false,
        error: "Note id is required",
      };
    }

    const existing = await db.get(NOTES_STORE, id);
    if (!existing) {
      return {
        success: false,
        error: "Note Not Found",
      };
    }

    const currentUser = authService.getCurrentUser();
    if (
      !currentUser ||
      !existing.author ||
      existing.author.email !== currentUser.email
    ) {
      return {
        success: false,
        error: "You can only delete your own notes",
      };
    }

    await db.delete(NOTES_STORE, id);

    return {
      success: true,
    };
  }
}

export const notesService = new NotesService();

// NOTES FUNCTIONS
export async function initNotesPage() {
  const noteContainer = document.getElementById("noteContainer");
  if (!noteContainer) return;

  const pageType = noteContainer.dataset.page;

  try {
    let notes;
    if (pageType === "personal") {
      notes = await notesService.fetchNotes({ type: "personal" });
    } else {
      notes = await notesService.fetchNotes();
    }
    renderNotes(notes, noteContainer);
  } catch (error) {
    console.error("Error loading notes:", error);
    noteContainer.innerHTML = "<p>Failed to load notes.</p>";
  }
}

function renderNotes(notes, noteContainer) {
  noteContainer.innerHTML = "";

  if (!notes || notes.length === 0) {
    noteContainer.innerHTML = "<p>No notes found.</p>";
    return;
  }

  notes.forEach((note) => {
    const card = document.createElement("article");
    card.classList.add("note");

    const authorName =
      typeof note.author === "object" ? note.author.name : note.author;

    card.innerHTML = `
      <figure>
        <img src="../assets/default-pfp.svg" alt="" loading="lazy" />
      </figure>

      <div class="note_content flex flex-col gap-2">
        <h3 class="note__author">${authorName}</h3>
        <p class="note__text">${note.text}</p>

        ${renderImages(note.images)}
      </div>
    `;

    noteContainer.appendChild(card);
  });
}

export function initCreatePage() {
  const form = document.querySelector("form.form");
  if (!form) return;

  const textArea = form.querySelector("#postContent");
  const submitButton = form.querySelector('button[type="submit"]');
  const imageInput = form.querySelector("#postImage");
  const uploadZone = form.querySelector(".file-upload-zone");

  let selectedImageUrl = null;

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    const existingPreview = uploadZone.querySelector(".file-upload-preview");
    if (existingPreview) existingPreview.remove();
    uploadZone.classList.remove("has-preview");
    selectedImageUrl = null;

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImageUrl = e.target.result;
      const preview = document.createElement("img");
      preview.src = selectedImageUrl;
      preview.alt = "Image preview";
      preview.className = "file-upload-preview";
      uploadZone.appendChild(preview);
      uploadZone.classList.add("has-preview");
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFormError(form);

    const text = textArea ? textArea.value : "";
    const visibilityInput = form.querySelector(
      'input[name="visibility"]:checked',
    );
    const type = visibilityInput?.value === "yourBoo" ? "personal" : "public";
    const images = selectedImageUrl ? [selectedImageUrl] : [];

    if (submitButton) submitButton.disabled = true;

    try {
      const result = await notesService.createNote({ text, type, images });
      if (!result.success) {
        showFormError(form, result.error);
        return;
      }

      window.location.href = "./feed.html";
    } catch (error) {
      showFormError(form, "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function renderImages(images = []) {
  const validImages = images.filter(
    (img) => typeof img === "string" && img.trim() !== "",
  );

  if (validImages.length === 0) return "";

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
