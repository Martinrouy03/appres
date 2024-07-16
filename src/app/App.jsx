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
  const date = new Date();
  const day = date.getDay() || 7;
  const year = date.getFullYear();
  const mm = date.getMonth();
  const monthDay = date.getDate();
  const init_week = Math.ceil(monthDay / 7);
  const [week, setWeek] = useState(init_week);
  const [month, setMonth] = useState(mm);
  const newDate = new Date(year, month, 1);
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
  // console.log("meals: ", meals);
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

  const [regimeId, setRegimeId] = useState("4");
  const [commandNb, setCommandNb] = useState(0);
  let token = localStorage.getItem("token") || "";
  const userId = localStorage.getItem("userId") || "";

  const firstDay = mm === month ? day : newDate.getDay(); // Jour de la semaine du premier jour du mois
  const lastDay = new Date(year, month + 1, 0).getDay(); // Jour de la semaine du dernier jour du mois
  let maxWeeks = computeMaxWeeks(year, month, 0);
  let lengthMax = 7;
  if (week === 1) {
    lengthMax = 7 - firstDay + 1;
  } else if (week === maxWeeks) {
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
                        if (mm === month - 1) {
                          setWeek(
                            Math.ceil(new Date(year, month, 0).getDate() / 7)
                          );
                        } else {
                          maxWeeks = computeMaxWeeks(year, month, 1);
                          console.log("maxWeeks: ", maxWeeks);
                          setWeek(maxWeeks);
                        }
                      }
                    }}
                    icon="fa-solid fa-chevron-left"
                    size="xl"
                    style={{ color: "#ab0032" }}
                  />
                )}
                <h1>Semaine </h1>
                {!(month - mm === commandNb - 1 && week === maxWeeks + 1) && (
                  <FontAwesomeIcon
                    onClick={() => {
                      if (week <= maxWeeks) {
                        setWeek(week + 1);
                      } else if (week > maxWeeks) {
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
                              firstDay,
                              place,
                              month
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
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default App;
