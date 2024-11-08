/** Interfaces y typos */
type Score = 1 | 2 | 3;

interface ModelReportAccessits {
  id: string;
  joke: string;
  score: Score;
  date: string;
}

interface IState {
  id: string;
  joke: string;
}

type ApiConfig = {
  url: string;
  description: string;
  dataMapping: {
    idField: string;
    jokeField: string;
  };
};

type ImaConfig = {
  src: string;
};

interface IApisFecthingJoke {
  [key: string]: ApiConfig;
}

interface IApisFecthingWeather {
  url: string;
}

interface IBackgrpupImage {
  [key: string]: ImaConfig;
}

interface IWeatherPrint {
  icon: string;
  description: string;
  temp: number;
  humidity: number;
}
/** Clases de la implementación */
class JokeReport {
  private dataReportAccessits: Array<ModelReportAccessits>;

  constructor(dataReportAccessits: Array<ModelReportAccessits>) {
    this.dataReportAccessits = dataReportAccessits;
  }

  reportJokeScore(joke: ModelReportAccessits): void {
    const index = this.isJokeAdd(joke.id);
    if (index !== -1) {
      this.updateExistingJokeScore(index, joke.score);
    } else {
      this.addNewJoke(joke);
    }
  }

  private addNewJoke(joke: ModelReportAccessits): void {
    this.dataReportAccessits.push(joke);
  }

  private isJokeAdd(id: string): number {
    return this.dataReportAccessits.findIndex((joke) => joke.id === id);
  }

  private updateExistingJokeScore(index: number, newScore: Score): void {
    this.dataReportAccessits[index] = {
      ...this.dataReportAccessits[index],
      score: newScore,
    };
  }
}

class JokeService {
  async fetchJoke(apis: ApiConfig): Promise<IState> {
    try {
      const res = await fetch(apis.url, {
        headers: { accept: "application/json" },
      });
      const result = await res.json();
      const id = result[apis.dataMapping.idField];
      const joke = result[apis.dataMapping.jokeField];

      const response: IState = { id, joke };
      console.log({ [apis.description]: response });
      return response;
    } catch {
      throw new Error("Error al hacer fetch");
    }
  }
}

class WeatherService {
  async fetchWeather(api: IApisFecthingWeather): Promise<IWeatherPrint> {
    try {
      const res = await fetch(api.url);
      const response = await res.json();
      const data: IWeatherPrint = {
        icon: response.weather[0].icon,
        description: response.weather[0].description,
        temp: response.main.temp,
        humidity: response.main.humidity,
      };
      return data;
    } catch {
      throw new Error("Error al hacer fetch");
    }
  }
}

class ImageService {
  constructor() {
    this.getHtmlImg();
  }

  setImageBackgroup(src: string) {
    this.getHtmlImg().forEach((img) => {
      img.src = src;
    });
  }

  private getHtmlImg() {
    const htmlImgages = [
      ...document.querySelectorAll(".bg"),
    ] as HTMLImageElement[];
    return htmlImgages;
  }
}

class JokeState {
  private JOKE_STATE: IState;

  constructor(initialJokeState: IState) {
    this.JOKE_STATE = initialJokeState;
  }

  setState(joke: IState): void {
    this.JOKE_STATE = joke;
  }

  getState(): IState {
    return this.JOKE_STATE;
  }
}

class JokePrint {
  constructor(private htmlElement: HTMLElement | null) {
    this.htmlElement = htmlElement;
  }

  printJoke(joke: IState) {
    this.htmlElement
      ? (this.htmlElement.textContent = joke.joke)
      : console.error("h4 element not found!");
  }
}
class WeatherPrint {
  constructor(
    private iconHtml: HTMLImageElement | null,
    private tempHtml: HTMLElement | null,
    private humidityHtml: HTMLElement | null,
    private descHtml: HTMLElement | null
  ) {}

  print(weather: IWeatherPrint) {
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
  getRandomApi(api: IApisFecthingJoke) {
    return api[this.getRandomIndex(api)];
  }

  getRandomImg(imgs: IBackgrpupImage) {
    return imgs[this.getRandomIndex(imgs)];
  }

  private getRandomIndex(obj: IBackgrpupImage | IApisFecthingJoke) {
    const apiNames = Object.keys(obj);
    const indexRandom = Math.floor(Math.random() * apiNames.length);
    return apiNames[indexRandom];
  }
}

class JokeUIController {
  constructor(
    private jokeService: JokeService,
    private weatherService: WeatherService,
    private apisWeather: IApisFecthingWeather,
    private weatherPrint: WeatherPrint,
    private jokeState: JokeState,
    private jokePrint: JokePrint,
    private jokeReport: JokeReport,
    private dynamicObj: DynamicApi,
    private imageService: ImageService,
    private apis: IApisFecthingJoke,
    private images: IBackgrpupImage,
    private btn: HTMLElement | null
  ) {
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

  private initialize(btn: HTMLElement | null) {
    this.initNextJokeButton(btn);
    this.initVotingButtons();
    this.handleNewJoke();
    this.getWeatherApi();
  }
  private initNextJokeButton(btn: HTMLElement | null) {
    btn?.addEventListener("click", () => {
      this.handleNewJoke();
    });
  }

  private initVotingButtons() {
    const buttons: Array<Score> = [1, 2, 3];
    buttons.forEach((score) => {
      const buttonsScore = document.getElementById(`btnScore${score}`);
      if (buttonsScore) {
        buttonsScore.addEventListener("click", () => {
          this.handleVote(score);
        });
      }
    });
  }

  private async handleNewJoke() {
    const urlApi = this.dynamicObj.getRandomApi(this.apis);
    const joke = await this.jokeService.fetchJoke(urlApi);
    const srcImg = this.dynamicObj.getRandomImg(this.images);
    this.imageService.setImageBackgroup(srcImg.src);
    this.jokeState.setState(joke);
    this.jokePrint.printJoke(joke);
  }

  private async getWeatherApi() {
    const weather = await this.weatherService.fetchWeather(this.apisWeather);
    this.weatherPrint.print(weather);
    console.log(weather);
  }

  private handleVote(score: Score): void {
    const dataJpoke: ModelReportAccessits = {
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
let dataReportAccessits: Array<ModelReportAccessits> = [];
let JOKE_STATE: IState = { id: "", joke: "" };
let APIS_JOKE: IApisFecthingJoke = {
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

let IMAGES_BG: IBackgrpupImage = {
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

let API_WEATHER: IApisFecthingWeather = {
  url: "https://api.openweathermap.org/data/2.5/weather?lat=41.418109927968686&lon=1.9654498050175224&appid=16cb1d0f3ea07a2bc3e832c78f7fdb77",
};

/** Inicializacón de los componentes html*/
const btn = document.getElementById("nextJoke");
const h4 = document.getElementById("joke");
const iconElement = document.getElementById("icon") as HTMLImageElement;
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

const weatherPrinter = new WeatherPrint(
  iconElement,
  tempElement,
  humidityElement,
  descriptionElement
);

const jokeUIController = new JokeUIController(
  jokeService,
  weatherService,
  API_WEATHER,
  weatherPrinter,
  jokeState,
  jokePrint,
  jokeReport,
  dynamicObj,
  imageService,
  APIS_JOKE,
  IMAGES_BG,
  btn
);
