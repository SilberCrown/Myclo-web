"use client";
import React from "react";

import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const [clothes, setClothes] = useState([]);
  const [temperature, setTemperature] = useState("");
  const [weather, setWeather] = useState("sunny");
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showAddClothes, setShowAddClothes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [upload, { loading: uploadLoading }] = useUpload();
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fetchWeatherData = async (position) => {
    try {
      const response = await fetch("/api/get-weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setTemperature(data.temperature.toString());
      setWeather(data.weather.toLowerCase());
      setLoading(false);
    } catch (error) {
      setLocationError("気象情報の取得に失敗しました");
      setLoading(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        },
        (error) => {
          setLocationError("位置情報の取得に失敗しました");
          setLoading(false);
        }
      );
    } else {
      setLocationError("お使いのブラウザは位置情報をサポートしていません");
      setLoading(false);
    }
  }, []);

  const handleAddClothes = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newClothes = {
      name: formData.get("name"),
      type: formData.get("type"),
      thickness: formData.get("thickness"),
    };

    if (e.target.image.files[0]) {
      const { url } = await upload({ file: e.target.image.files[0] });
      newClothes.image = url;
    }

    setClothes([...clothes, newClothes]);
    setShowAddClothes(false);
  };
  const generateAiSuggestion = () => {
    const temp = parseInt(temperature);
    let suggestion = { top: null, bottom: null, outer: null };

    if (temp < 15) {
      suggestion = {
        top: clothes.find((c) => c.type === "top" && c.thickness === "thick"),
        bottom: clothes.find(
          (c) => c.type === "bottom" && c.thickness === "thick"
        ),
        outer: clothes.find((c) => c.type === "outer"),
      };
    } else if (temp < 25) {
      suggestion = {
        top: clothes.find((c) => c.type === "top" && c.thickness === "medium"),
        bottom: clothes.find((c) => c.type === "bottom"),
        outer:
          weather === "rainy" ? clothes.find((c) => c.type === "outer") : null,
      };
    } else {
      suggestion = {
        top: clothes.find((c) => c.type === "top" && c.thickness === "thin"),
        bottom: clothes.find(
          (c) => c.type === "bottom" && c.thickness === "thin"
        ),
        outer: null,
      };
    }

    setAiSuggestion(suggestion);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800 font-sf-pro">
            Myclo
          </h1>
          <div className="flex items-center gap-4">
            <a href="/search" className="text-gray-600 hover:text-blue-500">
              <i className="fas fa-search text-xl"></i>
            </a>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button className="text-gray-600 hover:text-blue-500">
                  <i className="fas fa-bell text-xl"></i>
                </button>
                <a
                  href="/settings"
                  className="text-gray-600 hover:text-blue-500"
                >
                  <i className="fas fa-user-circle text-xl"></i>
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button className="text-sm bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">
                  ログイン
                </button>
                <button className="text-sm text-gray-600 hover:text-blue-500">
                  新規登録
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="bg-[#e8f5f0] px-4 py-2 text-center text-sm text-gray-700 mt-14">
        <p>
          🎉 新機能が追加されました！天気予報と連携した服装提案をお試しください
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 pb-20">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-600">天気情報を取得中...</p>
            </div>
          ) : locationError ? (
            <div className="text-center py-4">
              <p className="text-red-500">{locationError}</p>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <i
                    className={`fas fa-${
                      weather === "sunny"
                        ? "sun"
                        : weather === "rainy"
                        ? "cloud-rain"
                        : "cloud"
                    } text-2xl text-gray-700`}
                  ></i>
                  <span className="text-3xl font-medium text-gray-800">
                    {temperature}°C
                  </span>
                </div>
                <select
                  className="p-2 rounded-full bg-gray-50 text-gray-700 border-none focus:ring-2 focus:ring-blue-200"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                >
                  <option value="sunny">晴れ</option>
                  <option value="rainy">雨</option>
                  <option value="cloudy">曇り</option>
                </select>
              </div>
              <NewComponent
                onClick={generateAiSuggestion}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                AIコーディネート提案
              </NewComponent>
            </div>
          )}

          {aiSuggestion && (
            <div className="border-t border-gray-100 pt-4 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  おすすめコーディネート
                </h2>
                <button
                  onClick={() =>
                    setFavorites((prev) => [...prev, aiSuggestion])
                  }
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <i
                    className={`fas fa-heart text-xl ${
                      favorites.includes(aiSuggestion) ? "text-red-500" : ""
                    }`}
                  ></i>
                </button>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-2">
                {Object.entries(aiSuggestion).map(
                  ([key, item]) =>
                    item && (
                      <div
                        key={key}
                        className="flex-shrink-0 w-48 bg-white rounded-lg shadow-sm p-3"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-40 object-cover rounded-md mb-2"
                          />
                        )}
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {key}
                        </p>
                      </div>
                    )
                )}
              </div>
              <div className="flex justify-center gap-1 mt-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              </div>
            </div>
          )}
        </div>

        {showAddClothes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-md w-full mx-4 animate-fade-in">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  新しいアイテムを追加
                </h2>
              </div>
              <form onSubmit={handleAddClothes} className="p-4">
                <input
                  type="text"
                  name="name"
                  placeholder="アイテム名"
                  className="w-full p-3 rounded-lg bg-gray-50 border-none mb-3 focus:ring-2 focus:ring-blue-200"
                  required
                />
                <select
                  name="type"
                  className="w-full p-3 rounded-lg bg-gray-50 border-none mb-3 focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="top">トップス</option>
                  <option value="bottom">ボトムス</option>
                  <option value="outer">アウター</option>
                </select>
                <select
                  name="thickness"
                  className="w-full p-3 rounded-lg bg-gray-50 border-none mb-3 focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="thin">薄手</option>
                  <option value="medium">普通</option>
                  <option value="thick">厚手</option>
                </select>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full p-3 rounded-lg bg-gray-50 border-none mb-4"
                />
                <div className="flex justify-end gap-2">
                  <NewComponent
                    onClick={() => setShowAddClothes(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    キャンセル
                  </NewComponent>
                  <NewComponent
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? "アップロード中..." : "追加"}
                  </NewComponent>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              クローゼット
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="アイテムを検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-full bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-200"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {clothes
              .filter(
                (item) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.type.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow p-3 relative"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <button
                    onClick={() =>
                      setFavorites((prev) =>
                        prev.includes(index)
                          ? prev.filter((i) => i !== index)
                          : [...prev, index]
                      )
                    }
                    className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    <i
                      className={`fas fa-heart ${
                        favorites.includes(index)
                          ? "text-red-500"
                          : "text-white"
                      }`}
                    ></i>
                  </button>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.type === "top"
                      ? "トップス"
                      : item.type === "bottom"
                      ? "ボトムス"
                      : "アウター"}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
        <div className="flex justify-around py-3">
          <a href="/" className="text-blue-500">
            <i className="fas fa-home text-xl"></i>
            <span className="text-xs block mt-1">ホーム</span>
          </a>
          <a href="/search" className="text-gray-400 hover:text-blue-500">
            <i className="fas fa-search text-xl"></i>
            <span className="text-xs block mt-1">検索</span>
          </a>
          <a href="/favorites" className="text-gray-400 hover:text-blue-500">
            <i className="fas fa-heart text-xl"></i>
            <span className="text-xs block mt-1">お気に入り</span>
          </a>
          <a href="/settings" className="text-gray-400 hover:text-blue-500">
            <i className="fas fa-cog text-xl"></i>
            <span className="text-xs block mt-1">設定</span>
          </a>
        </div>
      </nav>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default MainComponent;