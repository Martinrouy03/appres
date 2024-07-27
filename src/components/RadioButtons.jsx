import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
// import config from "../app/configuration.json";
import { useSelector, shallowEqual } from "react-redux";

export default function RadioButtons({ regimes, regimeId, setRegimeId }) {
  const config = useSelector(
    (state) => state.configurationReducer.configuration,
    shallowEqual
  );
  const regimeColors = config.regimeColors;
  return (
    <FormControl>
      <RadioGroup
        aria-labelledby="radio-buttons"
        name="radio-buttons-group"
        defaultValue={regimeId}
        onChange={(event) => {
          setRegimeId(event.target.value);
        }}
      >
        {regimes.map((regime, index) => {
          const color = regimeColors.filter(
            (regimeColor) => regimeColor.code === regime.code
          );

          return (
            <FormControlLabel
              index={index}
              value={regime.rowid}
              control={
                <Radio
                  sx={{
                    color: "grey.400", // default color
                    "&.Mui-checked": {
                      color: color[0].color,
                    },
                  }}
                />
              }
              label={regime.label}
              style={{
                color: color[0].color,
                height: "25px",
              }}
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
}
