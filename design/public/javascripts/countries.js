(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  /*-----------------------------------------------
  |   Calendar
  -----------------------------------------------*/
  const appCountriesInit = () => {
    const Selectors = {
      ADD_COUNTRY_FORM: '#addCountryForm',
      ADD_COUNTRY_MODAL: '#addCountryModal',
      EDIT_COUNTRY_FORM: '#editCountryForm',
      EDIT_COUNTRY_MODAL: '#editCountryModal',
      REMOVE_COUNTRY_FORM: '#removeCountryForm',
      CALENDAR: '#appCalendar',
      ADD_INPUT_NAME: '[name="addName"]',
      ADD_INPUT_CODE2: '[name="addCode2"]',
      ADD_INPUT_CODE3: '[name="addCode3"]',
      ADD_INPUT_NUMCODE: '[name="addNumCode"]',
      EDIT_INPUT_ID: '[name="editID"]',
      EDIT_INPUT_NAME: '[name="editName"]',
      EDIT_INPUT_CODE2: '[name="editCode2"]',
      EDIT_INPUT_CODE3: '[name="editCode3"]',
      EDIT_INPUT_NUMCODE: '[name="editNumCode"]',
      REMOVE_INPUT_ID: '[name="editID"]',
      EDIT_BTN: '.editBtn',
      REMOVE_BTN: '.removeBtn'
    };

    const Events = {
      CLICK: 'click',
      SHOWN_BS_MODAL: 'shown.bs.modal',
      SUBMIT: 'submit'
    };

    const addCountryForm = document.querySelector(Selectors.ADD_COUNTRY_FORM);
    const addCountryModal = document.querySelector(Selectors.ADD_COUNTRY_MODAL);
    const editCountryForm = document.querySelector(Selectors.EDIT_COUNTRY_FORM);
    const editCountryModal = document.querySelector(Selectors.EDIT_COUNTRY_MODAL);
    const removeCountryForm = document.querySelector(Selectors.REMOVE_COUNTRY_FORM);
    document
      .querySelectorAll(Selectors.EDIT_BTN)
      .forEach(item => {
        item.addEventListener(Events.CLICK, e => {
          e.preventDefault();
        
          document.querySelector(Selectors.EDIT_INPUT_ID).value = e.target.closest("tr.position-static").children[2].textContent;
          document.querySelector(Selectors.EDIT_INPUT_NAME).value = e.target.closest("tr.position-static").children[3].textContent;
          document.querySelector(Selectors.EDIT_INPUT_CODE2).value = e.target.closest("tr.position-static").children[4].textContent;
          document.querySelector(Selectors.EDIT_INPUT_CODE3).value = e.target.closest("tr.position-static").children[5].textContent;
          document.querySelector(Selectors.EDIT_INPUT_NUMCODE).value = e.target.closest("tr.position-static").children[6].textContent;
        });
      });
    document
      .querySelectorAll(Selectors.REMOVE_BTN)
      .forEach(item => {
        item.addEventListener(Events.CLICK, e => {
          e.preventDefault();

          document.querySelector(Selectors.REMOVE_INPUT_ID).value = e.target.closest("tr.position-static").children[2].textContent;
        });
      });

    if (addCountryForm) {
      addCountryForm.addEventListener(Events.SUBMIT, e => {
        e.preventDefault();

        ajax.post("/api/country",
          {
            name: document.querySelector(Selectors.ADD_INPUT_NAME).value,
            code2: document.querySelector(Selectors.ADD_INPUT_CODE2).value,
            code3: document.querySelector(Selectors.ADD_INPUT_CODE3).value,
            numeric_code: document.querySelector(Selectors.ADD_INPUT_NUMCODE).value
          }, function(result) {
            if (result.result === "OK") {
                location.reload();
            } else {
                console.log(result.message);
            }
          }, null, null);
      });
    }

    if (addCountryModal) {
      addCountryModal.addEventListener(
        Events.SHOWN_BS_MODAL,
        ({ currentTarget }) => {
          currentTarget.querySelector(Selectors.ADD_INPUT_NAME)?.focus();
        }
      );
    }

    if (editCountryForm) {
      editCountryForm.addEventListener(Events.SUBMIT, e => {
        e.preventDefault();

        ajax.put("/api/country",
          {
            id: document.querySelector(Selectors.EDIT_INPUT_ID).value,
            name: document.querySelector(Selectors.EDIT_INPUT_NAME).value,
            code2: document.querySelector(Selectors.EDIT_INPUT_CODE2).value,
            code3: document.querySelector(Selectors.EDIT_INPUT_CODE3).value,
            numeric_code: document.querySelector(Selectors.EDIT_INPUT_NUMCODE).value
          }, function(result) {
            if (result.result === "OK") {
                location.reload();
            } else {
                console.log(result.message);
            }
          }, null, null);
      });
    }

    if (editCountryModal) {
      editCountryModal.addEventListener(
        Events.SHOWN_BS_MODAL,
        ({ currentTarget }) => {
          currentTarget.querySelector(Selectors.EDIT_INPUT_NAME)?.focus();
        }
      );
    }

    if (removeCountryForm) {
      removeCountryForm.addEventListener(Events.SUBMIT, e => {
        e.preventDefault();

        ajax.del("/api/country",
          {
            id: document.querySelector(Selectors.EDIT_INPUT_ID).value
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

  docReady(appCountriesInit);

}));