function openPopup(name) {
  var id = name === 'signin' ? 'signin-modal' : 'signup-modal';
  document.getElementById(id).classList.add('open');
}

function closeModals() {
  document.querySelectorAll('.modal-overlay').forEach(function (m) {
    m.classList.remove('open');
  });
}

document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      closeModals();
    }
  });
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeModals();
  }
});