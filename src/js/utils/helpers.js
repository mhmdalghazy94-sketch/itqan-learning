export function showMessage(container, message, { error = false } = {}) {
  const paragraph = document.createElement("p");
  paragraph.className = error ? "content-message content-message--error" : "content-message";
  paragraph.setAttribute("role", error ? "alert" : "status");
  paragraph.textContent = message;
  container.replaceChildren(paragraph);
}