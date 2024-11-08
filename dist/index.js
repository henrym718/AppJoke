"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/** Clases de la implementación */
class JokeReport {
    constructor(dataReportAccessits) {
        this.dataReportAccessits = dataReportAccessits;
    }
    reportJokeScore(joke) {
        const index = this.isJokeAdd(joke.id);
        if (index !== -1) {
            this.updateExistingJokeScore(index, joke.score);
        }
        else {
            this.addNewJoke(joke);
        }
    }
    addNewJoke(joke) {
        this.dataReportAccessits.push(joke);
    }
    isJokeAdd(id) {
        return this.dataReportAccessits.findIndex((joke) => joke.id === id);
    }
    updateExistingJokeScore(index, newScore) {
        this.dataReportAccessits[index] = Object.assign(Object.assign({}, this.dataReportAccessits[index]), { score: newScore });
    }
}
class JokeService {
    fetchJoke(apis) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield fetch(apis.url, {
                    headers: { accept: "application/json" },
                });
                const result = yield res.json();
                const id = result[apis.dataMapping.idField];
                const joke = result[apis.dataMapping.jokeField];
                const response = { id, joke };
                console.log({ [apis.description]: response });
                return response;
            }
            catch (_a) {
                throw new Error("Error al hacer fetch");
            }
        });
    }
}
class WeatherService {
    fetchWeather(api) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield fetch(api.url);
                const response = yield res.json();
                const data = {
                    icon: response.weather[0].icon,
                    description: response.weather[0].description,
                    temp: response.main.temp,
                    humidity: response.main.humidity,
                };
                return data;
            }
            catch (_a) {
                throw new Error("Error al hacer fetch");
            }
        });
    }
}
class ImageService {
    constructor() {
        this.getHtmlImg();
    }
    setImageBackgroup(src) {
        this.getHtmlImg().forEach((img) => {
            img.src = src;
        });
    }
    getHtmlImg() {
        const htmlImgages = [
            ...document.querySelectorAll(".bg"),
        ];
        return htmlImgages;
    }
}
class JokeState {
    constructor(initialJokeState) {
        this.JOKE_STATE = initialJokeState;
    }
    setState(joke) {
        this.JOKE_STATE = joke;
    }
    getState() {
        return this.JOKE_STATE;
    }
}
class JokePrint {
    constructor(htmlElement) {
        this.htmlElement = htmlElement;
        this.htmlElement = htmlElement;
    }
    printJoke(joke) {
        this.htmlElement
            ? (this.htmlElement.textContent = joke.joke)
            : console.error("h4 element not found!");
    }
}
class WeatherPrint {
    constructor(iconHtml, tempHtml, humidityHtml, descHtml) {
        this.iconHtml = iconHtml;
        this.tempHtml = tempHtml;
        this.humidityHtml = humidityHtml;
        this.descHtml = descHtml;
    }
    print(weather) {
        const srcIco = `https://openweathermap.org/img/wn/${weather.icon}.png`;
        if (this.iconHtml) {
            this.iconHtml.src = srcIco;
        }
        if (this.tempHtml) {
            this.tempHtml.textContent = `Temperatura: ${weather.temp}°F`;
        }
        if (this.humidityHtml) {
            this.humidityHtml.textContent = `Humedad: ${weather.humidity}%`;
        }
        if (this.descHtml) {
            this.descHtml.textContent = `Descripción: ${weather.description}`;
        }
    }
}
class DynamicApi {
    getRandomApi(api) {
        return api[this.getRandomIndex(api)];
    }
    getRandomImg(imgs) {
        return imgs[this.getRandomIndex(imgs)];
    }
    getRandomIndex(obj) {
        const apiNames = Object.keys(obj);
        const indexRandom = Math.floor(Math.random() * apiNames.length);
        return apiNames[indexRandom];
    }
}
class JokeUIController {
    constructor(jokeService, weatherService, apisWeather, weatherPrint, jokeState, jokePrint, jokeReport, dynamicObj, imageService, apis, images, btn) {
        this.jokeService = jokeService;
        this.weatherService = weatherService;
        this.apisWeather = apisWeather;
        this.weatherPrint = weatherPrint;
        this.jokeState = jokeState;
        this.jokePrint = jokePrint;
        this.jokeReport = jokeReport;
        this.dynamicObj = dynamicObj;
        this.imageService = imageService;
        this.apis = apis;
        this.images = images;
        this.btn = btn;
        this.jokeState = jokeState;
        this.weatherService = weatherService;
        this.apisWeather = apisWeather;
        this.weatherPrint = weatherPrint;
        this.jokePrint = jokePrint;
        this.jokeService = jokeService;
        this.jokeReport = jokeReport;
        this.dynamicObj = dynamicObj;
        this.imageService = imageService;
        this.apis = apis;
        this.images = images;
        this.initialize(btn);
    }
    initialize(btn) {
        this.initNextJokeButton(btn);
        this.initVotingButtons();
        this.handleNewJoke();
        this.getWeatherApi();
    }
    initNextJokeButton(btn) {
        btn === null || btn === void 0 ? void 0 : btn.addEventListener("click", () => {
            this.handleNewJoke();
        });
    }
    initVotingButtons() {
        const buttons = [1, 2, 3];
        buttons.forEach((score) => {
            const buttonsScore = document.getElementById(`btnScore${score}`);
            if (buttonsScore) {
                buttonsScore.addEventListener("click", () => {
                    this.handleVote(score);
                });
            }
        });
    }
    handleNewJoke() {
        return __awaiter(this, void 0, void 0, function* () {
            const urlApi = this.dynamicObj.getRandomApi(this.apis);
            const joke = yield this.jokeService.fetchJoke(urlApi);
            const srcImg = this.dynamicObj.getRandomImg(this.images);
            this.imageService.setImageBackgroup(srcImg.src);
            this.jokeState.setState(joke);
            this.jokePrint.printJoke(joke);
        });
    }
    getWeatherApi() {
        return __awaiter(this, void 0, void 0, function* () {
            const weather = yield this.weatherService.fetchWeather(this.apisWeather);
            this.weatherPrint.print(weather);
            console.log(weather);
        });
    }
    handleVote(score) {
        const dataJpoke = {
            id: this.jokeState.getState().id,
            joke: this.jokeState.getState().joke,
            date: new Date().toISOString(),
            score: score,
        };
        this.jokeReport.reportJokeScore(dataJpoke);
        console.log(dataReportAccessits);
    }
}
/** Inicialización de estados */
let dataReportAccessits = [];
let JOKE_STATE = { id: "", joke: "" };
let APIS_JOKE = {
    icanhazdadjoke: {
        url: "https://icanhazdadjoke.com/",
        description: "API from icanhazdadjoke",
        dataMapping: {
            idField: "id",
            jokeField: "joke",
        },
    },
    chucknorris: {
        url: "https://api.chucknorris.io/jokes/random",
        description: "API from chucknorris",
        dataMapping: {
            idField: "id",
            jokeField: "value",
        },
    },
};
let IMAGES_BG = {
    bg1: {
        src: "../assets/img1.png",
    },
    bg2: {
        src: "../assets/img2.png",
    },
    bg3: {
        src: "../assets/img3.png",
    },
};
let API_WEATHER = {
    url: "https://api.openweathermap.org/data/2.5/weather?lat=41.418109927968686&lon=1.9654498050175224&appid=16cb1d0f3ea07a2bc3e832c78f7fdb77",
};
/** Inicializacón de los componentes html*/
const btn = document.getElementById("nextJoke");
const h4 = document.getElementById("joke");
const iconElement = document.getElementById("icon");
const tempElement = document.getElementById("temp");
const humidityElement = document.getElementById("humidity");
const descriptionElement = document.getElementById("descriptiom");
/** Inicialización de Clases */
const jokeState = new JokeState(JOKE_STATE);
const jokePrint = new JokePrint(h4);
const jokeReport = new JokeReport(dataReportAccessits);
/** Factoría de API dinámica */
const dynamicObj = new DynamicApi();
// Servicios con API aleatoria
const jokeService = new JokeService();
const weatherService = new WeatherService();
const imageService = new ImageService();
const weatherPrinter = new WeatherPrint(iconElement, tempElement, humidityElement, descriptionElement);
const jokeUIController = new JokeUIController(jokeService, weatherService, API_WEATHER, weatherPrinter, jokeState, jokePrint, jokeReport, dynamicObj, imageService, APIS_JOKE, IMAGES_BG, btn);
