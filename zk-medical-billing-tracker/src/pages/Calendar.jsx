import React, { useEffect, useState } from "react";
import useData from "../hooks/useData";

export default function Calendar() {
  const data = useData();

  useEffect(() => {
    if (!data) return;
    const date = document.querySelector(".date"),
      daysContainer = document.querySelector(".days"),
      prev = document.querySelector(".prev"),
      next = document.querySelector(".next"),
      todayBtn = document.querySelector(".today-btn"),
      gotoBtn = document.querySelector(".goto-btn"),
      dateInput = document.querySelector(".date-input"),
      eventDay = document.querySelector(".event-day"),
      eventDate = document.querySelector(".event-date"),
      eventsContainer = document.querySelector(".events");

    let today = new Date();
    let activeDay;
    let month = today.getMonth();
    let year = today.getFullYear();

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let eventsArr = [];
    eventsArr = getEvents();

    //function to add days in days with class day and prev-date next-date on previous month and next month days and active on today
    function initCalendar() {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const prevLastDay = new Date(year, month, 0);
      const prevDays = prevLastDay.getDate();
      const lastDate = lastDay.getDate();
      const day = firstDay.getDay();
      const nextDays = 7 - lastDay.getDay() - 1;

      date.innerHTML = months[month] + " " + year;

      let days = "";

      for (let x = day; x > 0; x--) {
        days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
      }

      for (let i = 1; i <= lastDate; i++) {
        //check if event is present on that day
        let event = false;
        eventsArr.forEach((eventObj) => {
          if (
            eventObj.day === i &&
            eventObj.month === month + 1 &&
            eventObj.year === year
          ) {
            event = true;
          }
        });
        if (
          i === new Date().getDate() &&
          year === new Date().getFullYear() &&
          month === new Date().getMonth()
        ) {
          activeDay = i;
          getActiveDay(i);
          updateEvents(i);
          if (event) {
            days += `<div class="day today active event">${i}</div>`;
          } else {
            days += `<div class="day today active">${i}</div>`;
          }
        } else {
          if (event) {
            days += `<div class="day event">${i}</div>`;
          } else {
            days += `<div class="day ">${i}</div>`;
          }
        }
      }

      for (let j = 1; j <= nextDays; j++) {
        days += `<div class="day next-date">${j}</div>`;
      }
      daysContainer.innerHTML = days;
      addListner();
    }
    //function to add month and year on prev and next button
    function prevMonth() {
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
      initCalendar();
    }
    function nextMonth() {
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
      initCalendar();
    }
    prev.addEventListener("click", prevMonth);
    next.addEventListener("click", nextMonth);
    initCalendar();
    function updateEvents(date) {
      let events = "";
      eventsArr.forEach((event) => {
        if (
          date == event.day &&
          month + 1 == event.month &&
          year == event.year
        ) {
          events += `<div class="event">
            <div class="title">
              <h3 class="event-title">${event.title}</h3>
            </div>
        </div>`;
        }
      });
      if (events === "") {
        events = `<div class="no-event">
            <h3>No Events</h3>
        </div>`;
      }
      eventsContainer.innerHTML = events;
    }

    //function to add active on day
    function addListner() {
      const days = document.querySelectorAll(".day");
      days.forEach((day) => {
        day.addEventListener("click", (e) => {
          getActiveDay(e.target.innerHTML);
          updateEvents(Number(e.target.innerHTML));

          activeDay = Number(e.target.innerHTML);
          //remove active
          days.forEach((day) => {
            day.classList.remove("active");
          });
          //if clicked prev-date or next-date switch to that month
          if (e.target.classList.contains("prev-date")) {
            prevMonth();
            //add active to clicked day afte month is change
            setTimeout(() => {
              //add active where no prev-date or next-date
              const days = document.querySelectorAll(".day");
              days.forEach((day) => {
                if (
                  !day.classList.contains("prev-date") &&
                  day.innerHTML === e.target.innerHTML
                ) {
                  day.classList.add("active");
                }
              });
            }, 100);
          } else if (e.target.classList.contains("next-date")) {
            nextMonth();
            //add active to clicked day afte month is changed
            setTimeout(() => {
              const days = document.querySelectorAll(".day");
              days.forEach((day) => {
                if (
                  !day.classList.contains("next-date") &&
                  day.innerHTML === e.target.innerHTML
                ) {
                  day.classList.add("active");
                }
              });
            }, 100);
          } else {
            e.target.classList.add("active");
          }
        });
      });
    }

    todayBtn.addEventListener("click", () => {
      today = new Date();
      month = today.getMonth();
      year = today.getFullYear();
      initCalendar();
    });

    dateInput.addEventListener("input", (e) => {
      dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
      if (dateInput.value.length === 2) {
        dateInput.value += "/";
      }
      if (dateInput.value.length > 7) {
        dateInput.value = dateInput.value.slice(0, 7);
      }
      if (e.inputType === "deleteContentBackward") {
        if (dateInput.value.length === 3) {
          dateInput.value = dateInput.value.slice(0, 2);
        }
      }
    });

    gotoBtn.addEventListener("click", gotoDate);

    function gotoDate() {
      const dateArr = dateInput.value.split("/");
      if (dateArr.length === 2) {
        if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
          month = dateArr[0] - 1;
          year = dateArr[1];
          initCalendar();
          return;
        }
      }
      alert("Invalid Date");
    }

    //function get active day day name and date and update eventday eventdate
    function getActiveDay(date) {
      const day = new Date(year, month, date);
      const dayName = day.toString().split(" ")[0];
      eventDay.innerHTML = dayName;
      eventDate.innerHTML = date + " " + months[month] + " " + year;
    }

    function defineProperty() {
      var osccred = document.createElement("div");
      osccred.style.position = "absolute";
      osccred.style.bottom = "0";
      osccred.style.right = "0";
      osccred.style.fontSize = "10px";
      osccred.style.color = "#ccc";
      osccred.style.fontFamily = "sans-serif";
      osccred.style.padding = "5px";
      osccred.style.background = "#fff";
      osccred.style.borderTopLeftRadius = "5px";
      osccred.style.borderBottomRightRadius = "5px";
      osccred.style.boxShadow = "0 0 5px #ccc";
      document.body.appendChild(osccred);
    }

    defineProperty();

    function getEvents() {
      let copy = [...data.invoices];
      copy = copy
        .filter((invoice) => invoice.status == "pending")
        .map((invoice) => {
          let yourDate = new Date(invoice.createdAt.seconds * 1000);
          yourDate = yourDate.toISOString().split("T")[0];
          let [year, month, day] = yourDate.split("-");

          return {
            day: day,
            month: month,
            year: year,
            title: invoice.invoiceTitle,
          };
        });
      return copy;
    }
  }, [data]);

  return (
    <div>
      <h2 className="pt-14 text-2xl px-7 underline underline-offset-2">
        Search Pending Invoices By Date
      </h2>
      <div className="container">
        <div className="left">
          <div className="calendar">
            <div className="month">
              <svg
                className="rotate-180 prev"
                width="15"
                height="30"
                viewBox="0 0 30 48"
              >
                <path
                  d="M5.99998 0L0.359985 5.64L18.68 24L0.359985 42.36L5.99998 48L30 24L5.99998 0Z"
                  fill="black"
                />
              </svg>
              <div className="date" />
              <svg className="next" width="15" height="30" viewBox="0 0 30 48">
                <path
                  d="M5.99998 0L0.359985 5.64L18.68 24L0.359985 42.36L5.99998 48L30 24L5.99998 0Z"
                  fill="black"
                />
              </svg>
            </div>
            <div className="weekdays">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="days" />
            <div className="goto-today">
              <div className="goto">
                <input
                  type="text"
                  placeholder="mm/yyyy"
                  className="bg-white date-input"
                />
                <button className="goto-btn">Go</button>
              </div>
              <button className="today-btn">Today</button>
            </div>
          </div>
        </div>
        <div className="right">
          <div className="today-date">
            <div className="event-day">wed</div>
            <div className="event-date">12th december 2022</div>
          </div>
          <div className="events"></div>
        </div>
      </div>
    </div>
  );
}
