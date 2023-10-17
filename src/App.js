import { BUFFS, CROPS } from "./crops";
import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export default function App() {
  let [crops, setCrops] = useState(generateCrops());
  let [soil, setSoil] = useState(generateSoil());
  let [cnt, setCnt] = useState(0);

  let { width, height } = useWindowDimensions();

  function generateCrops() {
    let crops = [];
    for (let i = 0; i < 27; i++) crops.push(new Array(27).fill(-1));
    return crops;
  }

  function generateSoil() {
    let soil = [];
    for (let i = 0; i < 9; i++) soil.push(new Array(9).fill(false));
    return soil;
  }

  function reset() {
    setCrops(generateCrops());
    setSoil(generateSoil());
  }

  function toggleSoil(row, col) {
    if (cnt >= 9 && !soil[row][col]) return;
    let temp = [...soil];
    if (temp[row][col]) {
      setCnt(cnt - 1);
      let temp2 = [...crops];
      for (
        let r = Math.max(0, row - 1);
        r < Math.min(row, soil.length - 1);
        r++
      )
        for (
          let c = Math.max(0, col - 1);
          c < Math.min(col, soil.length - 1);
          c++
        )
          temp2[r][c] = -1;
      setCrops(temp2);
    } else setCnt(cnt + 1);
    temp[row][col] = !temp[row][col];
    setSoil(temp);
  }

  let minRow = soil.length;
  let maxRow = -1;
  let minCol = soil.length;
  let maxCol = -1;
  for (let r = 0; r < soil.length; r++)
    for (let c = 0; c < soil.length; c++)
      if (soil[r][c]) {
        minRow = Math.min(r, minRow);
        maxRow = Math.max(r, maxRow);
        minCol = Math.min(c, minCol);
        maxCol = Math.max(c, maxCol);
      }

  minRow = minRow === soil.length ? 4 : Math.max(minRow - (cnt < 9 ? 2 : 0), 0);
  maxRow =
    maxRow === -1 ? 4 : Math.min(maxRow + (cnt < 9 ? 2 : 0), soil.length - 1);

  minCol = minCol === soil.length ? 4 : Math.max(minCol - (cnt < 9 ? 2 : 0), 0);
  maxCol =
    maxCol === -1 ? 4 : Math.min(maxCol + (cnt < 9 ? 2 : 0), soil.length - 1);

  let h = height / (maxRow - minRow);
  let w = width / (maxCol - minCol);

  let size = Math.min(h, w) * 0.6;

  return (
    <div
      className="w-screen h-screen flex flex-col items-center bg-repeat relative"
      style={{ backgroundImage: 'url("/grass.jpg")' }}
    >
      <div
        className="w-full h-full absolute"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      />
      <div className="relative flex flex-col items-center">
        <div className="my-5">
          <img src="/logo.png" className="h-32" />
        </div>
        <div>
          <button className="btn btn-primary mb-5" onClick={reset}>
            Reset
          </button>
          <div className="btn btn-accent">
            {width / Math.max(1, Math.max(maxRow - minRow, maxCol - minCol))}
          </div>
          <div className="btn btn-accent">{width / 2}</div>
        </div>
        <div
          className="p-1 bg-black rounded-lg"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          {cnt === 0 ? (
            <button
              onClick={() => toggleSoil(4, 4)}
              className="m-1 rounded border-2 border-gray text-white"
              style={{
                width: Math.min(width, height) / 2 + "px",
                height: Math.min(width, height) / 2 + "px",
              }}
            >
              +
            </button>
          ) : (
            soil
              .filter((_, i) => minRow <= i && i <= maxRow)
              .map((row, r) => (
                <div key={"row" + r} className="flex">
                  {row
                    .filter((_, ii) => minCol <= ii && ii <= maxCol)
                    .map((col, c) =>
                      col ? (
                        <Soil
                          key={"soil-" + (r + minRow) + "," + (c + minCol)}
                          row={r + minRow}
                          col={c + minCol}
                          size={size}
                          toggleSoil={() => toggleSoil(r + minRow, c + minCol)}
                          crops={crops}
                          setCrops={setCrops}
                        />
                      ) : (
                        <button
                          disabled={cnt >= 9}
                          onClick={() => toggleSoil(r + minRow, c + minCol)}
                          key={"soil-" + (r + minRow) + "," + (c + minCol)}
                          className="m-1 rounded border-2 border-gray text-white"
                          style={{
                            width: size + "px",
                            height: size + "px",
                          }}
                        >
                          +
                        </button>
                      )
                    )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

function Soil({ row, col, size, toggleSoil, crops, setCrops }) {
  let [select, setSelect] = useState(-1);

  console.log(crops[row]);
  console.log(crops.filter((_, i) => i >= row - 1 && i < row + 2));
  return (
    <div
      className="relative bg-orange-950 rounded m-1"
      style={{
        width: size + "px",
        height: size + "px",
      }}
    >
      {crops
        .filter((_, i) => i >= row - 1 && i < row + 2)
        .map((cols) => cols.filter((_, ii) => ii >= col - 1 && ii < col + 2))
        .map((cropRow, r) => (
          <div className="flex" key={"crowRow-" + r}>
            {cropRow.map((crop, c) => (
              <div
                key={"crop-" + (r + row * 3 + "," + (c + col * 3))}
                disabled={setSelect !== -1}
                onClick={() => setSelect(r + row * 3 + "," + (c + col * 3))}
                className="flex relative cursor-pointer"
                style={{
                  width: size / 3 + "px",
                  height: size / 3 + "px",
                }}
              >
                {r + row * 3 + "," + (c + col * 3)} -{" "}
                {crops[r + row * 3][c + col * 3]}
                {select === r + row * 3 + "," + (c + col * 3) && (
                  <div
                    className="absolute -bottom-1 flex justify-center bg-neutral p-1"
                    style={{ width: (size / 6) * 12 + "px" }}
                  >
                    {CROPS.map((crop, ind) => (
                      <img
                        key={
                          "cropselect-" +
                          (r + row * 3 + "," + (c + col * 3) + "," + ind)
                        }
                        onClick={(ev) => {
                          ev.stopPropagation();
                          let temp = [...crops];
                          temp[r + row * 3][c + col * 3] = ind;
                          console.log(temp);
                          setSelect(-1);
                          setCrops(temp);
                        }}
                        src={crop.img}
                        style={{
                          width: size / 6 + "px",
                          height: size / 6 + "px",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      <button
        onClick={toggleSoil}
        className="absolute -left-2 -top-2 bg-error rounded p-0.5 text-xs text-white"
      >
        <FaTimes />
      </button>
    </div>
  );
}
