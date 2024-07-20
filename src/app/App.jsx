import { useState } from "react";
// Icons
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faChevronRight,
  faChevronLeft,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getMealCode,
  getMealLabel,
  getMealPrice,
  convertToUnix,
  computeShift,
  computeMaxWeeks,
  computeLengthMax,
  convertMonth,
  filterMeals,
  convertLinesToArray,
  computeDateShift,
} from "../utils/functions";
//Theming
import "./App.scss";
import "../fonts.css";
// *** Redux
import { useDispatch } from "react-redux";
import { shallowEqual, useSelector } from "react-redux";
import { useEffect } from "react";
// Actions
import {
  getOrder,
  addOrderLine,
  removeOrderLine,
} from "../services/services/OrderActions";
import { getPlaces } from "../services/services/PlacesActions";
import { getRegimes } from "../services/services/RegimesActions";
// Composants
import { CircularProgress } from "@mui/material";
import RadioButtons from "../components/RadioButtons";
import Header from "../components/Header";
import Line from "../components/Line";
import LoginModal from "../components/LoginModal";

// *** Rsdux Initialisation, store building
import { configureStore } from "@reduxjs/toolkit";
import OrderReducer from "../services/services/OrderReducer";
import PlacesReducer from "../services/services/PlacesReducer";
import RegimesReducer from "../services/services/RegimesReducer";
import LoginReducer from "../services/login/LoginReducer";

library.add(faChevronRight, faChevronLeft, faChevronUp, faCircleXmark);
export const store = configureStore({
  reducer: {
    orderReducer: OrderReducer,
    placesReducer: PlacesReducer,
    regimesReducer: RegimesReducer,
    loginReducer: LoginReducer,
  },
});

function App() {
  const dispatch = useDispatch();
  // fetch login variables in localStorage:
  let token = localStorage.getItem("token") || "";
  const userId = localStorage.getItem("userId") || "";

  // initializing date variables:
  const date = new Date();
  const day = date.getDay() || 7;
  const year = date.getFullYear();
  const mm = date.getMonth();
  const monthDay = date.getDate();
  const init_week = Math.ceil(monthDay / 7);

  // State instantiations:
  const [regimeId, setRegimeId] = useState("4");
  const [commandNb, setCommandNb] = useState(0);
  const [week, setWeek] = useState(init_week);
  const [month, setMonth] = useState(mm);

  // More date variables
  const newDate = new Date(year, month, 1);
  const firstWeekDay = mm === month ? day : newDate.getDay() || 7; // Jour de la semaine du premier jour du mois
  const lastWeekDay = new Date(year, month + 1, 0).getDay(); // Jour de la semaine du dernier jour du mois
  const maxWeeks = computeMaxWeeks(year, month, 0);
  const lengthMax = computeLengthMax(
    week,
    init_week,
    maxWeeks,
    firstWeekDay,
    lastWeekDay
  );

  // Selector instantiations:
  const order = useSelector((state) => state.orderReducer.order, shallowEqual);
  const places = useSelector(
    (state) => state.placesReducer.places,
    shallowEqual
  );
  const regimes = useSelector(
    (state) => state.regimesReducer.regimes,
    shallowEqual
  );
  const loading = useSelector(
    (state) => state.orderReducer.loading,
    shallowEqual
  );
  const user = useSelector(
    (state) => state.loginReducer.user.username,
    shallowEqual
  );
  const modalClose = useSelector(
    (state) => state.loginReducer.modalClose,
    shallowEqual
  );

  // fetch meals and disabledMeals arrays, used to display the checkboxs
  let result = {
    meals: [],
    disabledMeals: [],
  };
  result = order.lines ? convertLinesToArray(order.lines) : result;
  const meals = result.meals;
  const disabledMeals = result.disabledMeals;

  // Identifying the type of meals: 1 = Breakfast; 2 = Lunch; 3 = Dinner:
  const ids = [1, 2, 3];
  const maxid = ids[ids.length - 1]; // maxid is used to identify the last Line component of each Place table, in order to apply specific css (border-radius)

  useEffect(() => {
    token && dispatch(getPlaces(token));
    token && dispatch(getRegimes(token));
    token && dispatch(getOrder(userId, month, setCommandNb, token));
  }, [month, user, modalClose]);

  const handleWeekButtons = (id, month, week, place, suppress) => {
    const shift = computeShift(
      mm,
      month,
      1, // i
      day,
      firstWeekDay,
      week,
      init_week
    );

    // Determine startDate and endDate:
    let startDate = computeDateShift(mm, month, year, shift);
    let endDate = computeDateShift(mm, month, year, shift + 6);
    if ((mm === month && week === init_week) || week === 1) {
      startDate.setDate(startDate.getDate() + 7 - lengthMax);
    }
    if (week === maxWeeks) {
      endDate.setDate(endDate.getDate() - 7 + lengthMax);
    }
    console.log("Start Date: ", startDate.toDateString());
    console.log("End Date: ", endDate.toDateString());

    // Determine orderlines already existing within the selected week and id
    let selectedLines = [];
    let count = 0;
    selectedLines = order.lines.filter(
      (line) =>
        (getMealCode(line.libelle) === id || getMealCode(line.label) === id) &&
        (line.array_options.options_lin_datedebut >= convertToUnix(startDate) ||
          line.array_options.options_lin_datefin <= convertToUnix(endDate))
    );
    if (suppress) {
      console.log("suppress");
      dispatch(
        removeOrderLine(
          order.id,
          selectedLines[0].id,
          order.socid,
          month,
          token
        )
      );
    } else {
      console.log("not suppress");
      if (selectedLines.length > 0) {
        selectedLines.map((line) => {
          dispatch(
            removeOrderLine(order.id, line.id, order.socid, month, token)
          );
        });
      }
      dispatch(
        addOrderLine(
          order,
          month,
          {
            array_options: {
              options_lin_room: regimeId,
              options_lin_intakeplace: String(place.rowid),
              options_lin_datedebut: convertToUnix(startDate),
              options_lin_datefin: convertToUnix(endDate),
            },
            fk_product: String(id + 1),
            label: getMealLabel(id),
            qty: lengthMax,
            subprice: getMealPrice(id),
            remise_percent: 0,
          },
          token
        )
      );
    }
  };

  // determine start and end date:
  return (
    <>
      <Header token={token} />
      {!modalClose && !token && <LoginModal />}
      {!token ? (
        <div className="center">Veuillez vous connecter</div>
      ) : (
        <main className="container">
          <div className="center">
            <div className="center">
              {regimes && order.lines && (
                <RadioButtons
                  regimes={regimes}
                  regimeId={regimeId}
                  setRegimeId={setRegimeId}
                />
              )}
            </div>
            <div>
              <div className="center">
                {month > mm && (
                  <FontAwesomeIcon
                    onClick={() => {
                      if (mm === month - 1) {
                        setWeek(Math.ceil(monthDay / 7));
                      } else {
                        setWeek(1);
                      }
                      setMonth(month - 1);
                    }}
                    icon="fa-solid fa-chevron-left"
                    size="xl"
                    style={{ color: "#ab0032" }}
                  />
                )}
                <h1>{convertMonth(month)}</h1>
                {month - mm < commandNb - 1 && (
                  <FontAwesomeIcon
                    onClick={() => {
                      setWeek(1);
                      setMonth(month + 1);
                    }}
                    icon="fa-solid fa-chevron-right"
                    size="xl"
                    style={{ color: "#ab0032" }}
                  />
                )}
              </div>
              <div className="center">
                {!(month === mm && week === init_week) && (
                  <FontAwesomeIcon
                    onClick={() => {
                      if (week > 1) {
                        setWeek(week - 1);
                      } else if (week === 1) {
                        setMonth(month - 1);
                        const maxWeeks = computeMaxWeeks(year, month, 1);
                        setWeek(maxWeeks);
                      }
                    }}
                    icon="fa-solid fa-chevron-left"
                    size="xl"
                    style={{ color: "#ab0032" }}
                  />
                )}
                <h1>Semaine </h1>
                {!(month - mm === commandNb - 1 && week === maxWeeks) && (
                  <FontAwesomeIcon
                    onClick={() => {
                      if (week < maxWeeks) {
                        setWeek(week + 1);
                      } else if (week === maxWeeks) {
                        setWeek(1);
                        setMonth(month + 1);
                      }
                    }}
                    icon="fa-solid fa-chevron-right"
                    size="xl"
                    style={{ color: "#ab0032" }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="center">
            {loading && (
              <CircularProgress style={{ color: "#ab0032" }} size="30px" />
            )}
          </div>
          <div className="tables">
            {places && order.lines ? (
              places.map((place, index) => {
                return (
                  <div index={index} className="table">
                    <div className="table">
                      <div className="line">
                        <div
                          className="left-div"
                          style={{ borderRadius: "10px 10px 0 0" }}
                        >
                          <Line
                            id="dayName"
                            date={date}
                            week={week}
                            month={month}
                            place={place}
                          ></Line>
                          <Line
                            id="dayNum"
                            date={date}
                            week={week}
                            month={month}
                            place={place}
                          ></Line>
                        </div>
                      </div>
                      {ids.map((id) => {
                        return (
                          <div key={id} className="line">
                            <div
                              className="left-div"
                              id={id === maxid ? "last" : "notlast"}
                            >
                              {order.lines && (
                                <Line
                                  id={id}
                                  date={date}
                                  week={week}
                                  month={month}
                                  place={place}
                                  meals={meals}
                                  disabledMeals={disabledMeals}
                                  regimeId={regimeId}
                                ></Line>
                              )}
                            </div>
                            {filterMeals(
                              meals,
                              id,
                              week,
                              init_week,
                              firstWeekDay,
                              place.rowid,
                              month
                            ).length === lengthMax ? (
                              <FontAwesomeIcon
                                icon="fa-regular fa-circle-xmark"
                                size="2xl"
                                style={{ color: "#ab0032" }}
                                onClick={() => {
                                  handleWeekButtons(id, month, week, place, 1);
                                }}
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon="fa-solid fa-chevron-left"
                                onClick={() => {
                                  handleWeekButtons(id, month, week, place, 0);
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="center">Réservation indisponible</div>
            )}
            {/* <div className="buttons">
              <div className="line">
                <div
                  className="left-div"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {order.lines && (
                    <Line
                      id="buttons"
                      date={date}
                      week={week}
                      month={month}
                      meals={meals}
                      disabledMeals={disabledMeals}
                    ></Line>
                  )}
                </div>
              </div>
            </div> */}
          </div>
        </main>
      )}
    </>
  );
}

export default App;
