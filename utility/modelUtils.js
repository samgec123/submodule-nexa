const modelUtility = {
    modelParent: null,
    modal: null,
    modalBody: null,
    closeButton: null,
    modalOverlay: null,
    initModel(modelParent, modal, modalBody, closeButton, modalOverlay) {
        this.modelParent = modelParent;
        this.modal = modal;
        this.modalBody = modalBody;
        this.closeButton = closeButton;
        this.modalOverlay = modalOverlay;
    },
    openModal() {
        this.modelParent.style.display = 'block';
        this.modal.classList.remove('hide');
        this.modal.classList.add('active');
        this.modalOverlay.classList.add('active');
        this.modal.classList.add('modal-fade-in');
        this.modal.classList.remove('modal-fade-out');
    },
    closeModal() {
        this.modelParent.style.display = 'none';
        this.modal.classList.add('hide');
        this.modal.classList.remove('active');
        this.modalOverlay.classList.remove('active');
        this.modal.classList.remove('modal-fade-in');
        this.modal.classList.add('modal-fade-out');
    },
};
  
export default modelUtility;
  