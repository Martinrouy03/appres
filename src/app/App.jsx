import { useState } from "react";
// Icons
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faChevronRight,
  faChevronLeft,
  faChevronUp,
  faSquareMinus,
  faCow,
  faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { computeMaxWeeks, convertMonth, filterMeals } from "../utils/functions";
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

// *** Rsdux Initialisation, store building
import { configureStore } from "@reduxjs/toolkit";
import OrderReducer from "../services/services/OrderReducer";
import PlacesReducer from "../services/services/PlacesReducer";
import RegimesReducer from "../services/services/RegimesReducer";
// import loginReducer from "../features/login/loginSlice";

library.add(
  faChevronRight,
  faChevronLeft,
  faChevronUp,
  faSquareMinus,
  faCircleXmark,
  faCow,
  faLeaf
);
// import { fetchToken } from "../features/login/loginSlice";
export const token = "08bdd4b8e4590f7a6eb3ae2d1ec320ffaf030519";
export const store = configureStore({
  reducer: {
    orderReducer: OrderReducer,
    placesReducer: PlacesReducer,
    regimesReducer: RegimesReducer,
    // loginReducer: loginReducer,
  },
});

export const customer = "11"; //"11" "23105"

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
  const meals = useSelector((state) => state.orderReducer.meals, shallowEqual);
  const error = useSelector((state) => state.orderReducer.error, shallowEqual);
  const loading = useSelector(
    (state) => state.orderReducer.loading,
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
    dispatch(getPlaces());
    dispatch(getRegimes());
    dispatch(getOrder(customer, month, setCommandNb));
  }, [month]);
  console.log(week, relWeek, month);
  return (
    <>
      {error && <Alert severity="error">Erreur : {error.message}</Alert>}
      <Header />

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
                  weeks = Math.floor(nDays / 7); // nombre de semaines depuis la fin du mois dernier
                  setRelWeek(Math.ceil(monthDay / 7));
                } else {
                  weeks = computeMaxWeeks(year, month, 1);
                  setRelWeek(1);
                }
                setWeek(week - weeks - relWeek); // +1
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
                    console.log(
                      new Date(
                        year,
                        m,
                        7 * (w - 1) - weekDay + 1
                      ).toDateString(),
                      new Date(year, m, 7 * w - weekDay).toDateString()
                    );
                    // w--;
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
                  setRelWeek(maxWeeks);
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
              if (relWeek < maxWeeks) {
                setRelWeek(relWeek + 1);
                setWeek(week + 1);
              } else if (relWeek === maxWeeks) {
                setRelWeek(1);
                setMonth(month + 1);
              }
            }}
            icon="fa-solid fa-chevron-right"
            size="xl"
            style={{ color: "#ab0032" }}
          />
          {/* )} */}
        </div>
        <div className="center">
          {regimes && (
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
        {places &&
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
                          {/* {order.lines && ( */}
                          <Line
                            id={id}
                            date={date}
                            week={week}
                            month={month}
                            place={place}
                            meals={meals}
                            // order={order}
                            regimeId={regimeId}
                          ></Line>
                          {/* )} */}
                        </div>
                        {meals &&
                        filterMeals(meals, id, week, relWeek, firstDay, place)
                          .length === lengthMax ? (
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
          })}
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
                ></Line>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
