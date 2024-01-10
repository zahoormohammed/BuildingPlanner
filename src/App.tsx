import "./App.css";
import { tools as tool, colorPlatte as colorsList } from "./bin/data";
import { useState, useEffect, useLayoutEffect } from "react";
import { PointEvent, Tool } from "./interfaces/types";
import { useDrawVariables } from "./helpers/useDrawVariables";
import { useDrawShapes } from "./helpers/useDrawShapes";
import Capitalize from "./utils/Capitalize";

function App() {
  const [tools, setTools] = useState<Tool[]>([])
  const [startPoint, setStartPoint] = useState<PointEvent>()
  const [colorPlatte, setColorPlatte] = useState<string[]>([])
  const [cursorStyle, setCursorStyle] = useState<string>("/tools/brush.svg")
  const [color, setColor] = useState<string>("#000");
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [range, setRange] = useState<string>("5");
  const [selectTool, setSelectTool] = useState<string>("brush");
  const { canvas, ctx, snapShot } = useDrawVariables();
  const { drawCircle, drawLine, drawRectangle, drawEraser, drawTriangle } = useDrawShapes(ctx, color, startPoint, range)
  useEffect(() => {
    setTools(tool)
    setColorPlatte(colorsList)
  }, [])
  useEffect(() => {
    if (!canvas) return;
    ctx.current = canvas.current?.getContext("2d");
  }, [canvas, ctx])
  useLayoutEffect(() => {
    if (canvas.current) {
      canvas.current.width = canvas.current.clientWidth;
      canvas.current.height = canvas.current.clientHeight;
    }
  }, [canvas])
  const onSelectTool = (name: string) => {
    setSelectTool(name.toLowerCase());
    if (name.toLowerCase() === "brush") {
      setCursorStyle("/tools/brush.svg")
    }
    else if (name.toLowerCase() === "eraser") {
      setCursorStyle("/eraser.svg")
    }
    else {
      setCursorStyle("")
    }
  }
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setIsDrawing(true);
    if (!ctx.current) return;
    if (!canvas.current) return;
    ctx.current.beginPath();
    snapShot.current = ctx.current.getImageData(0, 0, canvas.current.width, canvas.current.height)
    const x = e.clientX - canvas.current?.getBoundingClientRect().left;
    const y = e.clientY - canvas.current?.getBoundingClientRect().top;
    const event = { x, y };
    setStartPoint(event);
  }
  const onMouseMove = (e: any) => {
    if (!isDrawing) return;
    if (!canvas.current) return;
    if (!ctx.current) return;
    if (!snapShot.current) return;
    ctx.current.putImageData(snapShot.current, 0, 0)
    const x = e.clientX - canvas.current?.getBoundingClientRect().left;
    const y = e.clientY - canvas.current?.getBoundingClientRect().top;
    const event = { x, y };
    switch (selectTool) {
      case "brush":
        drawLine(event);
        break;
      case "rectangle":
        drawRectangle(event);
        break;
      case "circle":
        drawCircle(event);
        break;
      case "triangle":
        drawTriangle(event);
        break;
      default: drawEraser(event);
    }
  }
  const onMouseUp = () => {
    setIsDrawing(false)
  }
  const onSelectColor = (e: string) => {
    setColor(e);
  }
  const onClearCanvas = () => {
    if (canvas.current)
      ctx.current?.clearRect(0, 0, canvas.current.width, canvas.current.height)
  }
  const handleSave = () => {
    if (!canvas.current) return;
    const link = document.createElement('a')
    link.setAttribute('download', "canvas-paint" + Date.now() + ".jpg");
    link.setAttribute('href', canvas.current.toDataURL("image/png"));
    link.click();
  }

  return (
    <>
      <div className="h-screen bg-[#F5F5F5] flex items-center ">
        <div className="toolbar w-[20%] py-4 px-5 h-full  bg-white">
        <div>
  <h2 className="text-[20px] font-semibold">Shapes</h2>
  <ul className="list-none mt-6">
    {tools.map((tool, index) => (
      <li
        className="flex gap-4 my-4 group cursor-pointer items-center p-4 bg-white shadow hover:shadow-md transition-all duration-300"
        key={index}
        onClick={() => onSelectTool(tool.name)}
      >
        <i dangerouslySetInnerHTML={{ __html: tool.icon }} className={`toolIcon ${Capitalize(selectTool) === tool.name ? "active" : ""}`} />
        <span className="text-[20px] text-gray-600 group-hover:text-[#764abc]" style={Capitalize(selectTool) === tool.name ? { color: "#764abc" } : {}}>
          {tool.name}
        </span>
      </li>
    ))}
  </ul>
</div>

          <div className="size mt-4">
            <input type="range" min="1" max="10" value={range} className="range-slider" onChange={(e) => setRange(e.target.value)} />
          </div>
          <div className="color-plate mt-4">
            {/* selected color */}
            <div className="text-center flex  items-center gap-5 mb-4">
              <div className="border-[#4A98F7]  border-solid border-2 p-1  rounded-[50%] cursor-pointer">
                <p className="rounded-[50%] border border-solid w-7 h-7" style={{ backgroundColor: color }}></p>
              </div>
            </div>
            <ul className="list-none flex gap-1 flex-wrap">
              {colorPlatte.map((color, index) => {
                return (
                  <li className="rounded-[50%] border-[#adadad] border border-solid  w-5 h-5 cursor-pointer" key={index}
                    style={{ backgroundColor: color }}
                    onClick={() => onSelectColor(color)}
                  />
                )
              })}
            </ul>
          </div>
          <div className="mt-5">
  <button className="px-4 py-3 rounded-lg bg-blue-500 border-blue-700 border-2 border-solid text-white" onClick={onClearCanvas}>Clear Canvas</button>
  <button className="px-4 py-3 mt-2 rounded-lg bg-purple-700 text-white border-purple-900 border-2 border-solid" onClick={handleSave}>Save as Image</button>
</div>

        </div>
        <div className="canvas-container w-[90%] h-[95%] bg-white shadow-lg mx-5 rounded-lg">
          <canvas
            className="w-full h-full"
            ref={canvas}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            style={{ cursor: cursorStyle ? `url(${cursorStyle}),auto` : "default" }}
          ></canvas>
        </div>
      </div>
    </>
  );
}

export default App;

// ref={canvas}