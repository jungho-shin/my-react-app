(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  /*-----------------------------------------------
  |   PrivacyPolicies
  -----------------------------------------------*/
  const appPrivacyPoliciesInit = () => {
    const Selectors = {
      ADD_MODAL: '#addModal',
      EDIT_FORM: '#editForm',
      EDIT_MODAL: '#editModal',
      REMOVE_FORM: '#removeForm',
      ADD_INPUT_TITLE: '[name="title"]',
      EDIT_INPUT_ID: '[name="editID"]',
      EDIT_INPUT_TITLE: '[name="editTitle"]',
      REMOVE_INPUT_ID: '[name="removeID"]',
      EDIT_BTN: '.editBtn',
      REMOVE_BTN: '.removeBtn'
    };

    const Events = {
      CLICK: 'click',
      SHOWN_BS_MODAL: 'shown.bs.modal',
      SUBMIT: 'submit'
    };

    const addForm = document.querySelector(Selectors.ADD_FORM);
    const addModal = document.querySelector(Selectors.ADD_MODAL);
    const editForm = document.querySelector(Selectors.EDIT_FORM);
    const editModal = document.querySelector(Selectors.EDIT_MODAL);
    const removeForm = document.querySelector(Selectors.REMOVE_FORM);
    document
      .querySelectorAll(Selectors.EDIT_BTN)
      .forEach(item => {
        item.addEventListener(Events.CLICK, e => {
          e.preventDefault();
        
          document.querySelector(Selectors.EDIT_INPUT_ID).value = e.target.closest("tr.position-static").children[1].textContent;
          document.querySelector(Selectors.EDIT_INPUT_TITLE).value = e.target.closest("tr.position-static").children[2].textContent;
          tinymce.get('editContents').setContent(e.target.closest("tr.position-static").children[3].textContent);
        });
      });
      document
      .querySelectorAll(Selectors.REMOVE_BTN)
      .forEach(item => {
        item.addEventListener(Events.CLICK, e => {
          e.preventDefault();

          document.querySelector(Selectors.REMOVE_INPUT_ID).value = e.target.closest("tr.position-static").children[1].textContent;
        });
      });

    if (addModal) {
      addModal.addEventListener(
        Events.SHOWN_BS_MODAL,
        ({ currentTarget }) => {
          currentTarget.querySelector(Selectors.ADD_INPUT_TITLE)?.focus();
        }
      );
    }
  
    if (editModal) {
      editModal.addEventListener(
        Events.SHOWN_BS_MODAL,
        ({ currentTarget }) => {
          currentTarget.querySelector(Selectors.EDIT_INPUT_TITLE)?.focus();
        }
      );
    }

    if (editForm) {
      editForm.addEventListener(Events.SUBMIT, e => {
        e.preventDefault();
  
        ajax.put("/api/privacypolicies",
          {
            id: document.querySelector(Selectors.EDIT_INPUT_ID).value,
            title: document.querySelector(Selectors.EDIT_INPUT_TITLE).value,
            contents: tinymce.get('editContents').getContent()
          }, function(result) {
            if (result.result === "OK") {
                location.reload();
            } else {
                console.log(result.message);
            }
          }, null, null);
      });
    }

    if (removeForm) {
      removeForm.addEventListener(Events.SUBMIT, e => {
        e.preventDefault();

        ajax.del("/api/privacypolicies",
          {
            id: document.querySelector(Selectors.REMOVE_INPUT_ID).value
          }, function(result) {
            if (result.result === "OK") {
                location.reload();
            } else {
                console.log(result.message);
            }
          }, null, null);
      });
    }    
  };

  const { docReady } = window.phoenix.utils;

  docReady(appPrivacyPoliciesInit);

}));