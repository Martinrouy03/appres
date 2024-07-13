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
  computeMaxWeeks,
  convertMonth,
  filterMeals,
  convertLinesToArray,
} from "../utils/functions";
//Theming
import "./App.scss";
import "../fonts.css";
// *** Redux
import { useDispatch } from "react-redux";
import { shallowEqual, useSelector } from "react-redux";
import { useEffect } from "react";

// Actions
import { getOrder } from "../services/services/OrderActions";
import { getPlaces } from "../services/services/PlacesActions";
import { getRegimes } from "../services/services/RegimesActions";
// Composants
import { Alert, CircularProgress } from "@mui/material";
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
  const order = useSelector((state) => state.orderReducer.order, shallowEqual);
  const places = useSelector(
    (state) => state.placesReducer.places,
    shallowEqual
  );
  const regimes = useSelector(
    (state) => state.regimesReducer.regimes,
    shallowEqual
  );
  let result = {
    meals: [],
    disabledMeals: [],
  };
  result = order.lines ? convertLinesToArray(order.lines) : result;
  const meals = result.meals;
  const disabledMeals = result.disabledMeals;
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
  const date = new Date();
  const day = date.getDay() || 7;
  const year = date.getFullYear();
  const mm = date.getMonth();
  const monthDay = date.getDate();
  const init_week = Math.ceil(monthDay / 7);
  const [week, setWeek] = useState(0);
  const [relWeek, setRelWeek] = useState(init_week);
  const [month, setMonth] = useState(mm);
  const [regimeId, setRegimeId] = useState("4");
  const [commandNb, setCommandNb] = useState(0);
  let token = localStorage.getItem("token") || "";
  const userId = localStorage.getItem("userId") || "";

  const firstDay = mm === month ? day : new Date(year, month, 1).getDay(); // Jour de la semaine du premier jour du mois
  const lastDay = new Date(year, month + 1, 0).getDay(); // Jour de la semaine du dernier jour du mois
  const maxWeeks = computeMaxWeeks(year, month, 0);
  let lengthMax = 7;
  if (week === 0 || relWeek === 0) {
    lengthMax = 7 - firstDay + 1;
  } else if (relWeek === maxWeeks) {
    lengthMax = lastDay || 7;
  }

  const ids = [1, 2, 3];
  useEffect(() => {
    token && dispatch(getPlaces(token));
    token && dispatch(getRegimes(token));
    token && dispatch(getOrder(userId, month, setCommandNb, token));
  }, [month, user, modalClose]);

  return (
    <>
      <Header token={token} />
      {!modalClose && !token && <LoginModal />}
      {!token ? (
        <div className="center">Veuillez vous connecter</div>
      ) : (
        <main className="container">
          <div className="center">
            {month > mm && (
              <FontAwesomeIcon
                onClick={() => {
                  const lastDayfromPreviousMonth = new Date(year, month, 0); // dernier jour du mois précédent
                  let nDays = 0;
                  let weeks = 0;

                  if (mm === month - 1) {
                    // mois actuel
                    nDays = lastDayfromPreviousMonth.getDate() - date.getDate(); // nombre de jours depuis la fin du mois dernier
                    weeks = Math.ceil(nDays / 7); // nombre de semaines depuis la fin du mois dernier
                    setRelWeek(Math.ceil(monthDay / 7));
                  } else {
                    weeks = computeMaxWeeks(year, month, 1);
                    setRelWeek(1);
                  }
                  console.log("check month minus:", week, weeks, relWeek);
                  setWeek(week - weeks); // - relWeek); // +1
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
                  let nDays = 0;
                  let tmp = new Date();
                  let weeks = 0;
                  // On calcule le nombre de semaine entre la date du jour et le dernier jour du mois considéré
                  for (let m = mm; m <= month; m++) {
                    tmp = new Date(year, m + 1, 0); // On calcule le nombre de jours du mois considéré
                    let w = 0;
                    if (m === mm) {
                      // pour le mois actuel
                      nDays = tmp.getDate() - date.getDate(); // On calcule le nombre de jours restants avant la fin du mois
                      w = Math.floor(nDays / 7);
                      const weekDay = new Date(year, m, 7 * w).getDay();
                      while (
                        new Date(year, m, 7 * w - weekDay).getDate() >
                        new Date(year, m, 7 * (w - 1) - weekDay + 1).getDate()
                      ) {
                        w++;
                      }
                      w--;
                    } else {
                      // pour les autres mois
                      w = Math.floor(tmp.getDate() / 7);
                      const weekDay = new Date(year, m, 7 * w).getDay();
                      while (
                        new Date(year, m, 7 * w - weekDay).getDate() >
                        new Date(year, m, 7 * (w - 1) - weekDay + 1).getDate()
                      ) {
                        w++;
                      }
                      w--;
                    }
                    weeks = weeks + w;
                  }
                  setRelWeek(1);
                  setWeek(weeks);
                  setMonth(month + 1);
                }}
                icon="fa-solid fa-chevron-right"
                size="xl"
                style={{ color: "#ab0032" }}
              />
            )}
          </div>
          <div className="center">
            {!(month === mm && relWeek === init_week) && (
              <FontAwesomeIcon
                onClick={() => {
                  if (relWeek > 1) {
                    setWeek(week - 1);
                    setRelWeek(relWeek - 1);
                  } else if (relWeek === 1) {
                    setMonth(month - 1);
                    const maxWeeks = computeMaxWeeks(year, month, 1);
                    setRelWeek(maxWeeks + 1);
                  }
                }}
                icon="fa-solid fa-chevron-left"
                size="xl"
                style={{ color: "#ab0032" }}
              />
            )}
            <h1>Semaine </h1>
            {/* {relWeek < maxWeeks && ( */}
            <FontAwesomeIcon
              onClick={() => {
                if (relWeek <= maxWeeks) {
                  setRelWeek(relWeek + 1);
                  setWeek(week + 1);
                } else if (relWeek > maxWeeks) {
                  setRelWeek(1);
                  setMonth(month + 1);
                }
              }}
              icon="fa-solid fa-chevron-right"
              size="xl"
              style={{ color: "#ab0032" }}
            />
          </div>
          <div className="center">
            {regimes && order.lines && (
              <RadioButtons
                regimes={regimes}
                regimeId={regimeId}
                setRegimeId={setRegimeId}
              />
            )}
          </div>
          <div className="loading center">
            {loading && (
              <CircularProgress style={{ color: "#ab0032" }} size="30px" />
            )}
          </div>
          {/* Lieu 1 */}
          {places && order.lines ? (
            places.map((place, index) => {
              return (
                <div index={index} className="tables">
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
                          <div className="left-div">
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
                            relWeek,
                            firstDay,
                            place
                          ).length === lengthMax ? (
                            <FontAwesomeIcon
                              icon="fa-regular fa-circle-xmark"
                              size="2xl"
                              style={{ color: "#ab0032" }}
                              // onClick={() => {
                              //   handleWeekButtons(id, week);
                              // }}
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon="fa-solid fa-chevron-left"
                              // onClick={() => {
                              //   handleWeekButtons(id, week);
                              // }}
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
          <div className="buttons">
            <div className="line">
              <div className="left-div" style={{ backgroundColor: "#FFFFFF" }}>
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
          </div>
        </main>
      )}
    </>
  );
}

export default App;
