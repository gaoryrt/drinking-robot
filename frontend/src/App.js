import React, { useEffect, useState } from "react";
import "./index"

function MyForm() {
  const [formState, setFormState] = useState({
    startTime: "",
    endTime: "",
    frequency: "",
    webhookURL:""
  });
  const options = [
    { value: 1, label: "每天1次" },
    { value: 2, label: "每天2次" },
    { value: 3, label: "每天3次" },
    { value: 4, label: "每天4次" },
    // 添加更多的选项
  ];
  const infoText = "超爱喝水";
  const handleInputChange = (event) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
  };
  useEffect(() => {
    // Get the query parameters from the current URL
    const queryParams = window.location.search;

    // Construct the URL with the query parameters
    const apiUrl = `${process.env.REACT_APP_SERVER_URL}/config${queryParams}`;
    console.log("api:",apiUrl)
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(res => {
        if (!res.ok)
            throw new Error('HTTP error ' + res.status);
        return res.json();
    })
    .then(data => setFormState(data))
    .catch(err => console.log('Fetch failed', err));
}, []);


  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/config`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formState)
    });

    if (response.ok) {
      alert("设置成功")
      window.close()
      console.log('Success');
    } else {
      alert("设置失败辣")
      console.error('Failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-blue-100">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 border-2 border-gray-200 space-y-4"
        style={{ maxWidth: '500px' }}
        onSubmit={handleSubmit}
      >
        <div className="mb-4 text-center" style={{ maxWidth: '400px' }}>
          <p className="text-xs text-gray-500 tracking-widest">{infoText}</p>
        </div>
        <div className="flex justify-between">
          <div className="mb-4 w-1/2 pr-3">
            <label className="block text-gray-700 text-sm font-bold mb-2">开始时间</label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="time"
              name="startTime"
              value={formState.startTime}
              onChange={handleInputChange}
            />
          </div>
  
          <div className="mb-4 w-1/2 pl-3">
            <label className="block text-gray-700 text-sm font-bold mb-2">结束时间</label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="time"
              name="endTime"
              value={formState.endTime}
              onChange={handleInputChange}
            />
          </div>
        </div>
  
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">提醒次数</label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="frequency"
            value={formState.frequency}
            onChange={handleInputChange}
          >
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
  
        {/* Webhook地址字段 */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Webhook地址</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            name="webhookURL"
            value={formState.webhookURL}
            onChange={handleInputChange}
            disabled={!!window.location.search}
          />
        </div>
  
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
  
}


function App() {
  return (
    <div className="App">
      <MyForm></MyForm>
    </div>
  );
}

export default App;
