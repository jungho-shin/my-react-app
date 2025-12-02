(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  /*-----------------------------------------------
  |   Schedules
  -----------------------------------------------*/
  const appSchedulesInit = () => {
    console.log("================================");
    const Selectors = {
      ADD_FORM: '#addForm',
      EDIT_FORM: '#editForm',
      REMOVE_FORM: '#removeForm',
      ADD_INPUT_SCHEDULE_NAME: '#addScheduleName',
      ADD_SELECT_DATA_TYPE_ID: '#addFloatingSelectDataType',
      ADD_INPUT_MINUTE: '#addMinute',
      ADD_INPUT_HOUR: '#addHour',
      ADD_INPUT_DAY: '#addDay',
      ADD_INPUT_MONTH: '#addMonth',
      ADD_INPUT_WEEK: '#addWeek',
      EDIT_INPUT_ID: '[name="editID"]',
      EDIT_INPUT_SCHEDULE_NAME: '#editScheduleName',
      EDIT_SELECT_DATA_TYPE_ID: '#editFloatingSelectDataType',
      EDIT_INPUT_MINUTE: '#editMinute',
      EDIT_INPUT_HOUR: '#editHour',
      EDIT_INPUT_DAY: '#editDay',
      EDIT_INPUT_MONTH: '#editMonth',
      EDIT_INPUT_WEEK: '#editWeek',
      EDIT_INPUT_START_DATE: '#editStartDatepicker',
      EDIT_INPUT_START_TIME: '#editStartTimepicker',
      EDIT_INPUT_QUANTITY: '#editQuantity',
      EDIT_SELECT_TIME_UNIT_ID: '#editFloatingSelectTimeUnit',
      EDIT_SELECT_TASK_STATUS_ID: '#editFloatingSelectTaskStatus',
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
    const editForm = document.querySelector(Selectors.EDIT_FORM);
    const removeForm = document.querySelector(Selectors.REMOVE_FORM);
    document
      .querySelectorAll(Selectors.EDIT_BTN)
      .forEach(item => {
        item.addEventListener(Events.CLICK, e => {
          e.preventDefault();
        
          document.querySelector(Selectors.EDIT_INPUT_ID).value = e.target.closest("tr.position-static").children[1].textContent;
          document.querySelector(Selectors.EDIT_INPUT_SCHEDULE_NAME).value = e.target.closest("tr.position-static").children[2].textContent;
          document.querySelector(Selectors.EDIT_SELECT_DATA_TYPE_ID).value = e.target.closest("tr.position-static").children[3].textContent;
          document.querySelector(Selectors.EDIT_INPUT_MINUTE).value = e.target.closest("tr.position-static").children[5].textContent;
          document.querySelector(Selectors.EDIT_INPUT_HOUR).value = e.target.closest("tr.position-static").children[6].textContent;
          document.querySelector(Selectors.EDIT_INPUT_DAY).value = e.target.closest("tr.position-static").children[7].textContent;
          document.querySelector(Selectors.EDIT_INPUT_MONTH).value = e.target.closest("tr.position-static").children[8].textContent;
          document.querySelector(Selectors.EDIT_INPUT_WEEK).value = e.target.closest("tr.position-static").children[9].textContent;
          document.querySelector(Selectors.EDIT_SELECT_TASK_STATUS_ID).value = e.target.closest("tr.position-static").children[10].textContent;
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
    if (addForm) {
      addForm.addEventListener(Events.SUBMIT, e => {
        e.preventDefault();

        ajax.post("/api/schedules",
          {
            schedule_name: document.querySelector(Selectors.ADD_INPUT_SCHEDULE_NAME)?.value,
            datatype_id: document.querySelector(Selectors.ADD_SELECT_DATA_TYPE_ID)?.value,
            minute: document.querySelector(Selectors.ADD_INPUT_MINUTE)?.value,
            hour: document.querySelector(Selectors.ADD_INPUT_HOUR)?.value,
            day: document.querySelector(Selectors.ADD_INPUT_DAY)?.value,
            month: document.querySelector(Selectors.ADD_INPUT_MONTH)?.value,
            week: document.querySelector(Selectors.ADD_INPUT_WEEK)?.value
          }, function(result) {
            if (result.result === "OK") {
                location.reload();
            } else {
                console.log(result.message);
            }
          }, null, null);
      });

      if (editForm) {
        editForm.addEventListener(Events.SUBMIT, e => {
          e.preventDefault();
    
          ajax.put("/api/schedules",
            {
              id: document.querySelector(Selectors.EDIT_INPUT_ID).value,
              schedule_name: document.querySelector(Selectors.EDIT_INPUT_SCHEDULE_NAME)?.value,
              datatype_id: document.querySelector(Selectors.EDIT_SELECT_DATA_TYPE_ID)?.value,
              minute: document.querySelector(Selectors.EDIT_INPUT_MINUTE)?.value,
              hour: document.querySelector(Selectors.EDIT_INPUT_HOUR)?.value,
              day: document.querySelector(Selectors.EDIT_INPUT_DAY)?.value,
              month: document.querySelector(Selectors.EDIT_INPUT_MONTH)?.value,
              week: document.querySelector(Selectors.EDIT_INPUT_WEEK)?.value,
              taskstatus_id: document.querySelector(Selectors.EDIT_SELECT_TASK_STATUS_ID)?.value
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
  
          ajax.del("/api/schedules",
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
    }
  };

  const { docReady } = window.phoenix.utils;

  docReady(appSchedulesInit);

}));