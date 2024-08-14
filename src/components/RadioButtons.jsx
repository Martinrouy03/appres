import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { useSelector, shallowEqual } from "react-redux";

export default function RadioButtons({ regimeId, setRegimeId, lang }) {
  const config = useSelector(
    (state) => state.configurationReducer.configuration,
    shallowEqual
  );
  const regimeConfig = config.regimeColors;
  const regimeTexts = config.language[lang].regimes;
  const regimeSelector = useSelector(
    (state) => state.regimesReducer.regimes,
    shallowEqual
  );
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
        {regimeSelector.map((regime, index) => {
          const regColor = regimeConfig.filter(
            (regimeColor) => regimeColor.code === regime.code
          );
          const regTxt = regimeTexts.filter(
            (regtxt) => regtxt.code === regime.code
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
                      color: regColor[0].color,
                    },
                  }}
                />
              }
              // label={regime.label}
              label={regTxt[0].label}
              style={{
                color: regColor[0].color,
                height: "25px",
              }}
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
}
