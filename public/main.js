class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
    });

    this.configure();
  }
  configure() {
    this.screen = "home";

    this.instructionGiven = false;

    this.score = localStorage.getItem("axa-bird-game-score");

    if (this.score === null) {
      this.score = 0;
    }

    this.highScore = localStorage.getItem("axa-bird-game-highScore");

    if (this.highScore === null) {
      this.highScore = 0;
    }

    this.remember = localStorage.getItem("axa-bird-game-remember");

    if (this.remember === null) {
      this.remember = false;

      this.username = null;

      this.email = null;

      this.news = null;
    } else if (this.remember) {
      this.username = localStorage.getItem("axa-bird-game-username");

      this.email = localStorage.getItem("axa-bird-game-email");

      this.news = localStorage.getItem("axa-bird-game-news");
    }

    this.codes = [];

    this.unlocked = null;

    this.soundOn = false;

    this.socket = new io();

    this.socket.on("userData", (data) => {
      if (data.codes) {
        try {
          const codes = JSON.parse(data.codes);
          if (Array.isArray(codes)) {
            this.codes = codes.sort((a, b) => a.points - b.points);
          }
        } catch (err) {
          console.log(err);
        }
      }
    });

    if (this.username) {
      this.socket.emit("userData", { username: this.username });
    }

    this.socket.on("usernameTaken", () => {
      this.notify(3);
    });

    this.socket.on("newUser", (data) => {
      if (data.remember) {
        this.username = data.username;

        this.email = data.email;

        localStorage.setItem("axa-bird-game-username", this.username);

        localStorage.setItem("axa-bird-game-email", this.email);

        localStorage.setItem("axa-bird-game-news", this.news);

        localStorage.setItem("axa-bird-game-remember", this.remember);
      }

      this.screen = "leaderboard";

      this.scene.restart();
    });

    this.socket.on("leaderboard", (data) => {
      this.loader.style.display = "none";

      this.addLeaderboardUI(data);
    });
  }

  preload() {
    this.load.setBaseURL("assets");
    this.load.plugin(
      "rexroundrectangleplugin",
      "plugins/rexroundrectangleplugin.min.js",
      true
    );
    this.load.image("UIBackground", "backgrounds/UIBackground.png");
    this.load.image("background", "backgrounds/background.png");
    this.load.image("logo", "UI/background-logo.png");
    this.load.image("play", "UI/play-button.png");
    this.load.image("heart", "player/heart.png");
    this.load.image("heart-filled", "player/heart-filled.png");
    this.load.image("emitte", "player/emitte.png");
    this.load.image("star", "collectibles/star.png");
    this.load.image("home", "UI/home-icon.png");
    this.load.image("info", "UI/info.png");
    this.load.image("close", "UI/close.png");
    this.load.image("infoIcon", "UI/info-icon.png");
    this.load.image("userIcon", "UI/user-icon.png");
    this.load.image("soundOn", "UI/soundon-button.png");
    this.load.image("soundOff", "UI/soundoff-button.png");
    this.load.image("unlockedIcon", "UI/unlocked-icon.png");
    this.load.image("leaderboardIcon", "UI/leaderboard-icon.png");
    this.load.image("leaderboardGold", "UI/gold.png");
    this.load.image("leaderboardSilver", "UI/silver.png");
    this.load.image("leaderboardBronze", "UI/bronze.png");
    this.load.image("copyIcon", "UI/copy.png");
    this.load.image("ground", "ground/ground2.png");
    this.load.image("b1", "player/bird-1.png");
    this.load.image("b2", "player/bird-2.png");

    for (let i = 1; i <= 152; ++i) {
      this.load.image(
        `devil${i}`,
        `Devil Emoji/fd1abf7e-069b-42d6-8022-72baf150dc66-${i - 1}.png`
      );
    }

    for (let i = 1; i <= 3; ++i) {
      this.load.image(`product${i}`, `products/product${i + 1}.png`);
    }

    for (let i = 1; i <= 3; ++i) {
      this.load.image(`cloud${i}`, `clouds/cloud${i}.png`);
    }

    this.load.audio("jump", "sounds/jump.mp3");

    this.load.audio("product", "sounds/product.mp3");

    this.load.audio("enemy", "sounds/enemy.mp3");

    this.load.audio("lost", "sounds/lost.mp3");

    this.load.audio("woosh", "sounds/Woosh.mp3");
  }

  create() {
    this.checkSocket();
    this.canJump = true;
  }
  checkSocket() {
    this.loader = document.querySelector("#loader");

    this.socketInterval = setInterval(() => {
      if (this.socket.connected) {
        clearInterval(this.socketInterval);

        loader.style.display = "none";

        this.addUI();
      }
    }, 50);
  }

  addUI() {
    if (this.screen === "home") {
      this.addHomeUI();
      // this.startGame();
    } else if (this.screen === "restart") {
      this.addRestartUI();
    } else if (this.screen === "replay") {
      this.addReplayUI();
    } else if (this.screen === "info") {
      this.addInfoUI();
    } else if (this.screen === "codes") {
      this.addCodesUI();
    } else if (this.screen === "unlocked") {
      this.addUnlockedUI();
    } else if (this.screen === "leaderboard") {
      this.loader.style.display = "block";
      this.socket.emit("leaderboard");
    }
  }
  addHomeUI() {
    this.UIBackground = this.add.image(400, 600, "UIBackground").setScale(1);

    this.infoIcon = this.add
      .image(740, 55, "infoIcon")
      .setScale(0.4)
      .setInteractive();

    this.infoIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.infoIcon,
        scale: 0.5,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.infoIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.screen = "info";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.logo = this.add.image(400, 100, "logo").setScale(1);

    this.titleText = this.add
      .text(
        400,
        300,
        "Jump your way upwards and collect\nAXA products. Unlock hidden offers in\nthe Rabble cashback app the higher\nscore you get.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "40px",
          color: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.optionsContainer = this.add
      .rexRoundRectangle(400, 900, 620, 480, 50, 0xffffff)
      .setDepth(5)
      .setScrollFactor(0);

    this.birdImage = this.add
      .image(670, 690, "b1")
      .setScale(1.4)
      .setDepth(Infinity);
    this.birdImage.angle = -15;
    this.birdImage.scaleX = -1.4;

    this.termsText = this.add
      .text(
        400,
        1170,
        "Powered by Md Mahabub. By playing this game you accept these Terms & policies.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "20px",
          color: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });
    this.termsText.on("pointerup", () => {
      const url = "https://www.proviva.se";
      window.open(url, "_blank");
    });

    this.option1 = this.add
      .rexRoundRectangle(400, 830, 520, 100, 50, 0xf3e3a3)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option1Text = this.add
      .text(400, 830, "Unlocked Offers", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);
    // color: "#2e218e",

    this.option2 = this.add
      .rexRoundRectangle(400, 945, 520, 100, 50, 0xfaa7ab)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option2Text = this.add
      .text(400, 945, "Leaderboard", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option3 = this.add
      .rexRoundRectangle(400, 1060, 520, 100, 50, 0x4e316e)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option3Text = this.add
      .text(400, 1060, "Play Game", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.bestScoreText = this.add
      .text(320, 730, `BEST: ${this.highScore}`, {
        fontFamily: "RakeslyRG",
        fontSize: "36px",
        stroke: "#000",
        strokeThickness: 1,
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.lastScoreText = this.add
      .text(480, 730, `LAST: ${this.score}`, {
        fontFamily: "RakeslyRG",
        fontSize: "36px",
        stroke: "#000",
        strokeThickness: 1,
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.divider = this.add
      .rectangle(400, 730, 5, 70, 0xeeeeee)
      .setDepth(6)
      .setScrollFactor(0);

    this.option1.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option1, this.option1Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option1, this.option1Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.screen = "codes";
              this.scene.restart();
            },
          });
        },
      });
    });

    this.option2.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option2, this.option2Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option2, this.option2Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.screen = "leaderboard";
              this.scene.restart();
            },
          });
        },
      });
    });

    this.option3.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option3, this.option3Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option3, this.option3Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.elements = [
                this.UIBackground,
                this.logo,
                this.titleText,
                this.optionsContainer,
                this.birdImage,
                this.termsText,
                this.option1,
                this.option1Text,
                this.option2,
                this.option2Text,
                this.option3,
                this.option3Text,
                this.bestScoreText,
                this.lastScoreText,
                this.divider,
              ];

              this.elements.forEach((element) => {
                element.destroy();
              });

              this.startGame();
            },
          });
        },
      });
    });
  }
  addRestartUI() {
    this.UIBackground = this.add.rectangle(400, 600, 800, 1200, 0xffffff);

    this.homeIcon = this.add
      .image(740, 55, "home")
      .setScale(0.4)
      .setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.3,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.scoreBox = this.add
      .rexRoundRectangle(400, 200, 300, 70, 20, 0x4e316e)
      .setDepth(Infinity)
      .setScrollFactor(0);

    this.scoreImage = this.add
      .image(265, 200, "star")
      .setDepth(Infinity)
      .setScrollFactor(0)
      .setScale(0.9);

    this.scoreText = this.add
      .text(400, 200, this.score, {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#fff",
        align: "center",
        stroke: "#fff",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.ballImage = this.add
      .image(400, 100, "logo")
      .setScale(0.7)
      .setDepth(Infinity);

    this.titleText = this.add
      .text(
        400,
        330,
        "Do you want to submit your score? And be\nable to win some nice prizes? The username\nwill be shown on the leaderboard.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "36px",
          color: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.usernameInput = this.add.dom(400, 470).createElement(
      "input",
      `
      	outline: none;
      	border: none;
      	padding: 0px 30px;
      	width: 450px;
      	height: 90px;
      	font-size: 30px;
      	font-weight: bold;
      	background: #ebf4f5;
      	border-radius: 20px;
      `
    );

    this.usernameInput.node.setAttribute("placeholder", "Username");

    this.usernameInput.node.setAttribute("maxLength", "15");

    this.emailInput = this.add.dom(400, 580).createElement(
      "input",
      `
      	outline: none;
      	border: none;
      	padding: 0px 30px;
      	width: 450px;
      	height: 90px;
      	font-size: 30px;
      	font-weight: bold;
      	background: #ebf4f5;
      	border-radius: 20px;
      `
    );

    this.emailInput.node.setAttribute("placeholder", "Email");

    this.emailInput.node.setAttribute("type", "email");

    this.agreeCheckBox = this.add
      .dom(145, 650)
      .createElement(
        "div",
        `
      	width: 70px;
      	height: 70px;
      	background: #ebf4f5;
      	border-radius: 20px;
      	cursor: pointer;
      `
      )
      .setInteractive()
      .setOrigin(0);

    this.agreeCheckBoxMark = this.add
      .dom(165, 670)
      .createElement(
        "div",
        `
      	width: 30px;
      	height: 30px;
      	background: #000;
      	border-radius: 10px;
      	cursor: pointer;
      `
      )
      .setAlpha(0.6)
      .setVisible(false)
      .setOrigin(0);

    this.agreeText = this.add
      .text(235, 663, "Agree to terms & conditions?", {
        fontFamily: "RakeslyRG",
        fontSize: "36px",
        color: "#511a73",
        align: "center",
      })
      .setInteractive({ cursor: "pointer" });
    this.agreeText.on("pointerup", () => {
      const url = "https://proviva.se";
      window.open(url, "_blank");
    });

    this.signCheckBox = this.add
      .dom(145, 735)
      .createElement(
        "div",
        `
      	width: 70px;
      	height: 70px;
      	background: #ebf4f5;
      	border-radius: 20px;
      	cursor: pointer;
      `
      )
      .setInteractive()
      .setOrigin(0);

    this.signCheckBoxMark = this.add
      .dom(165, 755)
      .createElement(
        "div",
        `
      	width: 30px;
      	height: 30px;
      	background: #000;
      	border-radius: 10px;
      	cursor: pointer;
      `
      )
      .setAlpha(0.6)
      .setVisible(false)
      .setOrigin(0);

    this.signText = this.add.text(235, 748, "Sign up for newsletter", {
      fontFamily: "RakeslyRG",
      fontSize: "36px",
      color: "#511a73",
      align: "center",
    });

    this.rememberCheckBox = this.add
      .dom(145, 820)
      .createElement(
        "div",
        `
      	width: 70px;
      	height: 70px;
      	background: #ebf4f5;
      	border-radius: 20px;
      	cursor: pointer;
      `
      )
      .setInteractive()
      .setOrigin(0);

    this.rememberCheckBoxMark = this.add
      .dom(165, 840)
      .createElement(
        "div",
        `
      	width: 30px;
      	height: 30px;
      	background: #000;
      	border-radius: 10px;
      	cursor: pointer;
      `
      )
      .setAlpha(0.6)
      .setVisible(false)
      .setOrigin(0);

    this.agreeText = this.add.text(235, 833, "Remember me", {
      fontFamily: "RakeslyRG",
      fontSize: "36px",
      color: "#511a73",
      align: "center",
    });

    this.agreeCheckBox.on("pointerdown", () => {
      this.agreeCheckBoxMark.setVisible(!this.agreeCheckBoxMark.visible);

      if (this.agreeCheckBoxMark.visible) {
        this.option1.setAlpha(1);

        this.option1.setInteractive();
      } else {
        this.option1.setAlpha(0.4);

        this.option1.removeInteractive();
      }
    });

    this.signCheckBox.on("pointerdown", () => {
      this.news = !this.news;

      this.signCheckBoxMark.setVisible(!this.signCheckBoxMark.visible);
    });

    this.rememberCheckBox.on("pointerdown", () => {
      this.remember = !this.remember;

      this.rememberCheckBoxMark.setVisible(!this.rememberCheckBoxMark.visible);
    });

    this.option1 = this.add
      .rexRoundRectangle(400, 975, 520, 100, 50, 0x3e9e79)
      .setDepth(5)
      .setScrollFactor(0)
      .setAlpha(0.4);

    this.option1Text = this.add
      .text(400, 975, "Submit result", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option2 = this.add
      .rexRoundRectangle(400, 1090, 520, 100, 50, 0x4e316e)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option2Text = this.add
      .text(400, 1090, "Nope, let's start over", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option1.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option1, this.option1Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option1, this.option1Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              if (this.validateUsername(this.usernameInput.node.value)) {
                if (this.validateEmail(this.emailInput.node.value)) {
                  this.socket.emit(
                    "scoreUpdate",
                    {
                      username: this.usernameInput.node.value,
                      email: this.emailInput.node.value,
                      score: this.score,
                      remember: this.remember,
                      news: this.news,
                      newUser: true,
                    },
                    (data) => {
                      if (this.remember) {
                        this.username = data.username;
                        this.email = data.email;
                        localStorage.setItem(
                          "axa-bird-game-username",
                          this.username
                        );
                        localStorage.setItem("axa-bird-game-email", this.email);
                        localStorage.setItem("axa-bird-game-news", this.news);
                        localStorage.setItem(
                          "axa-bird-game-remember",
                          this.remember
                        );
                      }

                      if (data.unlocked) {
                        this.unlocked = data.unlocked;
                        this.screen = "unlocked";
                        this.scene.restart();
                      } else {
                        this.screen = "replay";
                        this.scene.restart();
                      }
                    }
                  );
                } else {
                  this.notify(2);
                }
              } else {
                this.notify(1);
              }
            },
          });
        },
      });
    });

    this.option2.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option2, this.option2Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option2, this.option2Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.elements = [
                this.UIBackground,
                this.homeIcon,
                this.scoreBox,
                this.scoreImage,
                this.scoreText,
                this.ballImage,
                this.titleText,
                this.usernameInput,
                this.emailInput,
                this.agreeCheckBox,
                this.agreeCheckBoxMark,
                this.agreeText,
                this.signCheckBox,
                this.signCheckBoxMark,
                this.signText,
                this.rememberCheckBox,
                this.rememberCheckBoxMark,
                this.agreeText,
                this.option1,
                this.option1Text,
                this.option2,
                this.option2Text,
                this.option2,
                this.termsText,
              ];

              this.elements.forEach((element) => {
                element.destroy();
              });

              this.startGame();
            },
          });
        },
      });
    });

    this.termsText = this.add
      .text(
        400,
        1170,
        "Powered by Rabble. By playing this game you accept these Terms & policies.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "20px",
          color: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });
    this.termsText.on("pointerup", () => {
      const url = "https://www.proviva.se";
      window.open(url, "_blank");
    });
  }
  addReplayUI() {
    this.background = this.add
      .image(400, 600, "background")
      .setScale(1.4)
      .setScrollFactor(0)
      .setDepth(0);

    this.homeIcon = this.add
      .image(740, 55, "home")
      .setScale(0.5)
      .setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.4,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.5,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.scoreTitle = this.add
      .text(
        400,
        170,
        this.score > this.tempHighScore ? "New highscore" : "Your score",
        {
          fontFamily: "RakeslyRG",
          fontSize: "40px",
          color: "#000",
          align: "center",
          stroke: "#000",
          strokeThickness: 1,
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.scoreBox = this.add
      .rexRoundRectangle(400, 250, 300, 70, 20, 0x4e316e)
      .setDepth(10)
      .setScrollFactor(0);

    this.scoreImage = this.add
      .image(265, 250, "star")
      .setDepth(Infinity)
      .setScrollFactor(0)
      .setScale(0.9);

    this.scoreText = this.add
      .text(400, 250, this.score, {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#fff",
        align: "center",
        stroke: "#fff",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.playButton = this.add
      .image(400, 600, "play")
      .setScale(1.3)
      .setInteractive();

    this.playTitle = this.add
      .text(400, 850, "Play again", {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.playButton.on("pointerdown", () => {
      this.tweens.add({
        targets: this.playButton,
        scale: 1.1,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.playButton,
            scale: 1.3,
            duration: 100,

            onComplete: () => {
              this.elements = [
                this.background,
                this.homeIcon,
                this.scoreTitle,
                this.scoreBox,
                this.scoreImage,
                this.scoreText,
                this.playButton,
                this.playTitle,
              ];

              this.elements.forEach((element) => {
                element.destroy();
              });

              this.startGame();
            },
          });
        },
      });
    });
  }
  addLeaderboardUI(data) {
    this.background = this.add
      .image(400, 600, "background")
      .setScale(1.4)
      .setScrollFactor(0)
      .setDepth(0);

    if (this.remember) {
      this.userIcon = this.add
        .image(650, 55, "userIcon")
        .setScale(0.5)
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(Infinity);

      this.userIcon.on("pointerdown", () => {
        this.tweens.add({
          targets: this.userIcon,
          scale: 0.4,
          duration: 100,

          onComplete: () => {
            this.tweens.add({
              targets: this.userIcon,
              scale: 0.5,
              duration: 100,

              onComplete: () => {
                this.userIcon.destroy();

                this.notify(4);

                this.username = null;

                this.email = null;

                this.remember = false;

                localStorage.removeItem("axa-bird-game-remember");

                localStorage.removeItem("axa-bird-game-username");

                localStorage.removeItem("axa-bird-game-email");
              },
            });
          },
        });
      });
    }

    this.homeIcon = this.add
      .image(740, 55, "home")
      .setScale(0.4)
      .setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.5,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.leaderboardImage = this.add.image(400, 170, "leaderboardIcon");

    this.leaderboardTitle = this.add
      .text(400, 310, "Leaderboard", {
        fontFamily: "RakeslyRG",
        fontSize: "45px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.scores = Object.entries(data)
      .map((score) => {
        return score[1];
      })
      .sort((a, b) => b.score - a.score);

    this.players = this.add.dom(400, 375, "div");

    this.players.node.style = `
      	margin: 0px 0px 0px -300px;
      	padding: 0px 20px 0px 0px;
      	width: 600px;
      	height: 770px;
      	display: flex;
      	flex-direction: column;
      	align-items: center;
      	justify-content: center;
      	overflow-y: auto;
      `;

    this.players.node.innerHTML = ``;

    this.scores.forEach((user, index) => {
      this.players.node.innerHTML += `
      		<div class="scoreBox">
      			<div class="scoreImageBox">
      				${
                index < 3
                  ? `<img class="scoreImage" src="assets/positions/${
                      index + 1
                    }.png"/>`
                  : `<div class="scoreText"> ${index + 1}. </div>`
              }
      			</div>

      			<div class="${
              user.username === this.username ? "scoreTitlePlus" : "scoreTitle"
            }">
      				${user.username}
      			</div>

      			<div class="${
              user.username === this.username ? "scoreValuePlus" : "scoreValue"
            }">
      				${user.score}
      			</div>
      		</div>
      	`;
    });
  }
  addCodesUI() {
    this.background = this.add
      .image(400, 600, "background")
      .setScale(1.4)
      .setScrollFactor(0)
      .setDepth(0);

    this.homeIcon = this.add
      .image(740, 55, "home")
      .setScale(0.4)
      .setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.5,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.unlockedImage = this.add.image(400, 170, "unlockedIcon");

    this.unlockedTitle = this.add
      .text(400, 310, "Unlocked codes", {
        fontFamily: "RakeslyRG",
        fontSize: "45px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.codes.forEach((code, index) => {
      const y = 450 + index * 110;

      const codeBox = this.add
        .rexRoundRectangle(400, y, 520, 100, 20, 0xffffff)
        .setDepth(5)
        .setScrollFactor(0);

      const scoreImage = this.add
        .image(192, y, "star")
        .setDepth(Infinity)
        .setScrollFactor(0)
        .setScale(0.7);

      const scoreText = this.add
        .text(300, y, `${code.points} points`, {
          fontFamily: "RakeslyRG",
          fontSize: "32px",
          color: "#000",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(6);

      const codeText = this.add
        .text(515, y, code.code, {
          fontFamily: "RakeslyRG",
          fontSize: "32px",
          color: "#000",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(6);

      const codeCopy = this.add
        .image(610, y - 3, "copyIcon")
        .setDepth(Infinity)
        .setScrollFactor(0)
        .setScale(0.1)
        .setInteractive();

      codeCopy.on("pointerdown", () => {
        this.tweens.add({
          targets: codeCopy,
          scale: 0.08,
          duration: 100,

          onComplete: () => {
            this.tweens.add({
              targets: codeCopy,
              scale: 0.1,
              duration: 100,

              onComplete: () => {
                navigator.clipboard.writeText(code.code);

                this.notify(5);
              },
            });
          },
        });
      });
    });

    this.rabbleButton = this.add
      .rexRoundRectangle(400, 1060, 420, 100, 50, 0x4e316e)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.rabbleButtonText = this.add
      .text(400, 1060, "Go to Rabble", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.rabbleButton.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.rabbleButton, this.rabbleButtonText],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.rabbleButton, this.rabbleButtonText],
            scale: 1,
            duration: 100,

            onComplete: () => {},
          });
        },
      });
    });
  }
  addUnlockedUI() {
    this.UIBackground = this.add.rectangle(400, 600, 800, 1200, 0xffffff);

    this.homeIcon = this.add
      .image(740, 55, "home")
      .setScale(0.5)
      .setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.4,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.5,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.scoreBox = this.add
      .rexRoundRectangle(400, 200, 300, 70, 20, 0x4e316e)
      .setDepth(10)
      .setScrollFactor(0);

    this.scoreImage = this.add
      .image(265, 200, "star")
      .setDepth(Infinity)
      .setScrollFactor(0)
      .setScale(0.9);

    this.scoreText = this.add
      .text(400, 200, this.score, {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#fff",
        align: "center",
        stroke: "#fff",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.ballImage = this.add
      .image(400, 100, "logo")
      .setScale(0.7)
      .setDepth(Infinity);

    if (!this.unlocked) {
      this.scene.restart();
      return;
    }

    this.titleText = this.add
      .text(
        400,
        340,
        `Congrats! You score over ${this.unlocked.points}\npoints and unlocked a special\ndeal in Rabble.`,
        {
          fontFamily: "RakeslyRG",
          fontSize: "40px",
          color: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.productImage = this.add.image(400, 595, "product1").setScale(1.1);

    this.productBox = this.add
      .rexRoundRectangle(400, 850, 520, 100, 20, 0xebf4f5)
      .setDepth(Infinity)
      .setScrollFactor(0);

    this.codeText = this.add
      .text(235, 850, this.unlocked.code, {
        fontFamily: "RakeslyRG",
        fontSize: "35px",
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(Infinity);

    this.codeCopy = this.add
      .image(485, 850, "copyIcon")
      .setDepth(Infinity)
      .setScrollFactor(0)
      .setScale(0.1)
      .setInteractive();

    this.copyCodeText = this.add
      .text(575, 850, "Copy Code", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#bababa",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(Infinity)
      .setInteractive();

    this.codeCopy.on("pointerdown", () => {
      this.tweens.add({
        targets: this.codeCopy,
        scale: 0.08,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.codeCopy,
            scale: 0.1,
            duration: 100,

            onComplete: () => {
              navigator.clipboard.writeText(this.unlocked.code);

              this.notify(6);
            },
          });
        },
      });
    });

    this.copyCodeText.on("pointerdown", () => {
      this.tweens.add({
        targets: this.codeCopy,
        scale: 0.08,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.codeCopy,
            scale: 0.1,
            duration: 100,

            onComplete: () => {
              navigator.clipboard.writeText(this.unlocked.code);

              this.notify(6);
            },
          });
        },
      });
    });

    this.option1 = this.add
      .rexRoundRectangle(400, 975, 520, 100, 50, 0x335519)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option1Text = this.add
      .text(400, 975, "Redeem code on Rabble", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option2 = this.add
      .rexRoundRectangle(400, 1090, 520, 100, 50, 0x4e316e)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option2Text = this.add
      .text(400, 1090, "Play again", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option1.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option1, this.option1Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option1, this.option1Text],
            scale: 1,
            duration: 100,

            onComplete: () => {},
          });
        },
      });
    });

    this.option2.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option2, this.option2Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option2, this.option2Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              let elements = [
                this.UIackground,
                this.homeIcon,
                this.scoreBox,
                this.scoreImage,
                this.scoreText,
                this.ballImage,
                this.titleText,
                this.productImage,
                this.productBox,
                this.codeText,
                this.codeCopy,
                this.copyCodeText,
                this.option1,
                this.option1Text,
                this.option2,
                this.option2Text,
                this.termsText,
              ];

              elements.forEach((element) => {
                if (element) {
                  element.destroy();
                }
              });

              this.startGame();
            },
          });
        },
      });
    });

    this.termsText = this.add
      .text(
        400,
        1170,
        "Powered by Rabble. By playing this game you accept these Terms & policies.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "20px",
          color: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });
    this.termsText.on("pointerup", () => {
      const url = "https://www.proviva.se";
      window.open(url, "_blank");
    });
  }
  addInfoUI() {
    this.UIBackground = this.add.rectangle(400, 600, 800, 1200, 0xffffff);

    this.homeIcon = this.add
      .image(740, 55, "home")
      .setScale(0.4)
      .setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.4,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.5,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.infoImage = this.add.image(400, 170, "info").setScale();

    this.infoTitle = this.add
      .text(400, 310, "Information", {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.infoText = this.add
      .text(
        400,
        710,
        "Desktop Controls: Use left and right arrow keys\nto control the ball.\n\nMobile Controls: Touch left and right sides of the\nscreen to control the ball.\n\nSpring: Allows you to jump higher.\n\nJetpack: Gives you flying ability for a few seconds.\n\nProducts: Collect them to win extra points\nand rewards.\n\nMonsters: AVOID! You will lost the game if you\ncollide with them.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "35px",
          color: "#000",
          align: "center",
          stroke: "#000",
          strokeThickness: 0,
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);
  }
  validateEmail(value) {
    const validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (value.match(validRegex)) {
      return true;
    } else {
      return false;
    }
  }
  validateUsername(value) {
    // Define the regex pattern to disallow certain characters
    const pattern = /[ .$#[\]\/\x00-\x1F\x7F]/;
    // Test the input string against the pattern
    if (pattern.test(value)) {
      return false; // Invalid string (contains disallowed characters)
    }
    return true; // Valid string
  }

  startGame() {
    this.angleSpeed = 0;
    this.hoopY = 0;
    this.createAnimations();
    this.addBackground();
    this.addGameUI();
    this.addSounds();
    this.addScores();
    this.addLife();
    this.ground = this.physics.add.image(1200, 1020, "ground").setScale(1);

    if (!this.instructionGiven) {
      this.instructionBox = this.add
        .rexRoundRectangle(400, 600, 700, 600, 30, 0xffffff)
        .setDepth(10)
        .setScrollFactor(0)
        .setOrigin(0.5);
      this.instructionText1 = this.add
        .text(300, 370, "How to play", {
          fontFamily: "RakeslyRG",
          fontSize: "50px",
          color: "#000",
          align: "center",
          stroke: "#000",
        })
        .setDepth(11);
      this.instructionText2 = this.add
        .text(
          150,
          500,
          "Press space key or touch on the\nscreen to jump. You have to pass\nthe ball throw the hoops. Bacteria\ngivesyou extra bonus.",
          {
            fontFamily: "RakeslyRG",
            fontSize: "40px",
            color: "#000",
            align: "center",
            stroke: "#000",
          }
        )
        .setDepth(11);

      this.closeIcon = this.add
        .image(680, 370, "close")

        .setDepth(11)
        .setInteractive();
      this.closeIcon.on("pointerdown", () => {
        this.tweens.add({
          targets: this.closeIcon,
          scale: 0.9,
          duration: 100,

          onComplete: () => {
            this.tweens.add({
              targets: this.closeIcon,
              scale: 1,
              duration: 100,

              onComplete: () => {
                this.tweens.add({
                  targets: [
                    this.closeIcon,
                    this.instructionBox,
                    this.instructionText1,
                    this.instructionText2,
                  ],
                  alpha: { from: 1, to: 0.3 },
                  duration: 200,
                  onComplete: () => {
                    this.instructionGiven = true;
                    this.closeIcon.destroy();
                    this.instructionBox.destroy();
                    this.instructionText1.destroy();
                    this.instructionText2.destroy();
                    this.ground.destroy();
                    this.start();
                  },
                });
              },
            });
          },
        });
      });
    }
    if (this.instructionGiven) {
      this.start();
    }
  }
  createAnimations() {
    const devilFrames = [];
    for (let i = 1; i <= 152; ++i) {
      devilFrames.push({ key: `devil${i}` });
    }
    this.anims.create({
      key: "devilAnimation",
      frames: devilFrames,
      frameRate: 45,
      repeat: -1,
    });

    const birdFrames = [];
    for (let i = 1; i <= 2; ++i) {
      birdFrames.push({ key: `b${i}` });
    }

    this.anims.create({
      key: "birdAnimation",
      frames: birdFrames,
      frameRate: 15,
      repeat: -1,
    });

    // const birdFrames = [];
    // for (let i = 1; i <= 81; ++i) {
    //   birdFrames.push({ key: `bird${i}` });
    // }
    // this.anims.create({
    //   key: "birdAnimation",
    //   frames: birdFrames,
    //   frameRate: 30,
    //   repeat: -1,
    // });
  }
  addBackground() {
    this.background = this.add
      .image(400, 600, "background")
      .setScale(1.2)
      .setScrollFactor(0)
      .setDepth(0);
  }
  addGameUI() {
    this.homeIcon = this.add
      .image(660, 55, "home")
      .setScale(0.4)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.3,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.playing = false;

              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.soundIcon = this.add
      .image(740, 55, this.soundOn ? "soundOn" : "soundOff")
      .setScale(0.4)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.soundIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.soundIcon,
        scale: 0.3,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.soundIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              if (this.soundOn) {
                this.sound.stopAll();

                this.soundOn = false;

                this.soundIcon.setTexture("soundOff");
              } else {
                this.soundOn = true;

                this.soundIcon.setTexture("soundOn");
              }
            },
          });
        },
      });
    });
  }
  addSounds() {
    this.jumpSound = this.sound.add("jump");

    this.productSound = this.sound.add("product");

    this.lostSound = this.sound.add("lost");

    this.hoopSound = this.sound.add("woosh");
  }
  addScores() {
    this.score = 0;

    this.scoreBox = this.add
      .rexRoundRectangle(60, 32, 140, 45, 15, 0x4e316e)
      .setDepth(10)
      .setScrollFactor(0)
      .setOrigin(0);

    this.scoreImage = this.add
      .image(65, 55, "star")
      .setDepth(Infinity)
      .setScrollFactor(0)
      .setScale(0.6);

    this.scoreText = this.add
      .text(140, 55, this.score, {
        fontFamily: "RakeslyRG",
        fontSize: "28px",
        color: "#fff",
        align: "center",
        stroke: "#fff",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);
  }
  addLife() {
    this.life = 3;
    this.lifes = [];
    this.lifeBox = this.add
      .rexRoundRectangle(340, 33, 140, 45, 15, 0x4e316e)
      .setDepth(10)
      .setScrollFactor(0)
      .setOrigin(0);

    for (let i = 0; i < 3; i++) {
      this.lifeImage = this.add
        .image(300 + 70 + i * 40, 55, "heart")
        .setDepth(Infinity)
        .setScrollFactor(0)
        .setScale(0.8);
    }
    for (let i = 0; i < this.life; i++) {
      this.lifeImage = this.add
        .image(300 + 70 + i * 40, 55, "heart-filled")
        .setDepth(Infinity)
        .setScrollFactor(0)
        .setScale(0.8);
      this.lifes.push(this.lifeImage);
    }
  }

  start() {
    this.playing = true;
    this.devils = [];
    this.devilCollides = [];
    this.products = [];
    this.productCollides = [];
    this.devilsAndProductY = 400;
    this.pointTimes = 500;

    this.setup();
    this.createPlayer();
    this.createControls();
    this.createTouchControls();
    this.addClouds();
    this.addGround();
    // this.createEmitters();
    this.addDevilsAndProducts();

    for (let i = 0; i < this.randomBetween(1, 4); ++i) {
      const cloud = this.physics.add
        .image(
          this.randomBetween(-200, 1000),
          this.randomBetween(50, 600),
          `cloud${this.randomBetween(1, 3)}`
        )
        .setScrollFactor(1, 0)
        .setDepth(1);

      this.clouds1.push(cloud);

      cloud.setGravity(0);

      cloud.setVelocityX(this.randomBetween(5, 7) * 0.1 * this.player.speed);
    }
  }
  setup() {
    this.ground = this.physics.add
      .image(1200, 1020, "ground")
      .setScale(1)
      .setVelocityX(20);
  }
  createPlayer() {
    this.player = this.physics.add
      .sprite(400, 300, "bird1")
      .setScale(0.8)
      .setDepth(4)
      .setCircle(30, 10, 5)
      .setAngle(10);

    this.player.anims.play("birdAnimation");

    this.player.speed = 100;

    this.player.moveDirection = {
      right: false,
    };

    this.player.flying = false;

    this.player.lost = false;

    this.player.ended = false;

    this.player.body.setGravityY(800);

    this.cameras.main.startFollow(this.player);

    this.cameras.main.setBounds(0, 0, 800, 1200, true);

    this.leftWall = this.physics.add
      .image(0, 600, null)
      .setSize(1, 1200)
      .setVisible(false)
      .setVelocityX(this.player.speed);
  }
  createEmitters() {
    this.emitter = this.add.particles(0, 0, "emitte", {
      frame: "Match3_Icon_23",
      x: {
        onEmit: (particle, key, t, value) => {
          return this.player.x;
        },
        onUpdate: (particle, key, t, value) => {
          return value;
        },
      },
      y: {
        onEmit: (particle, key, t, value) => {
          return this.player.y;
        },
        onUpdate: (particle, key, t, value) => {
          return value + t * 1;
        },
      },
      scale: { start: 0.12, end: 0.1 },
      // scale: 0.3,
      alpha: { start: 0.8, end: 0 },
      speed: 20,
      // speedX: -500,
      // speedY: 100,
      lifespan: 500,
    });
    this.emitter.setDepth(3);
  }
  createControls() {
    this.player.moveDirection.right = true;
    this.input.keyboard.on("keydown", (event) => {
      if (event.key === " " && this.canJump && !this.player.lost) {
        this.canJump = true;
        this.player.setVelocityY(-400);
        if (this.soundOn) {
          this.jumpSound.play();
        }
        setTimeout(() => {
          this.canJump = true;
        }, 800);
      } else {
      }
    });

    this.input.keyboard.on("keyup", (event) => {
      if (event.key === " ") {
        this.player.moveDirection.right = false;
      }
    });
  }
  createTouchControls() {
    this.touchLeft = this.add
      .rectangle(200, 600, 400, 1200, 0xffffff)
      .setDepth(5)
      .setScrollFactor(0)
      .setAlpha(0.001)
      .setInteractive();

    this.touchRight = this.add
      .rectangle(600, 600, 400, 1200, 0xffffff)
      .setDepth(5)
      .setScrollFactor(0)
      .setAlpha(0.001)
      .setInteractive();

    this.touchLeft.on("pointerdown", () => {
      this.player.setVelocityY(-400);
      if (this.soundOn) {
        this.jumpSound.play();
      }
    });

    this.touchRight.on("pointerdown", () => {
      this.player.setVelocityY(-400);
      if (this.soundOn) {
        this.jumpSound.play();
      }
    });
  }
  addClouds() {
    this.clouds1 = [];

    this.clouds2 = [];

    this.generateClouds();

    this.time.addEvent({
      delay: 10000,

      callback: () => {
        this.addClouds();
      },
    });
  }
  generateClouds() {
    for (let i = 0; i < this.randomBetween(1, 4); ++i) {
      const cloud = this.physics.add
        .image(
          this.player.x + 800,
          this.randomBetween(50, 600),
          `cloud${this.randomBetween(1, 3)}`
        )
        .setScrollFactor(1, 0)
        .setDepth(1);
      this.clouds2.push(cloud);
      cloud.setGravity(0);
      cloud.setVelocityX(this.randomBetween(5, 7) * 0.1 * this.player.speed);
    }
  }
  addGround() {
    this.ground = this.physics.add
      .image(this.player.x + 3200, 1020, "ground")
      .setScale(1)
      .setVelocityX(20);
    this.physics.world.on("worldstep", () => {
      if (this.ground.x <= this.player.x + 802) {
        this.addGround();
      }
    });
  }

  addDevilsAndProducts() {
    this.generateDevilAndProducts();
    this.time.addEvent({
      delay: (3000 * 100) / this.player.speed,

      callback: () => {
        this.addDevilsAndProducts();
      },
    });
  }

  generateDevilAndProducts() {
    let upDown = 0;
    let random = this.randomBetween(0, 35);
    if (random < 5) {
      upDown = 2;
    } else if (random < 10) {
      upDown = 1.5;
    } else if (random < 15) {
      upDown = 1;
    } else if (random < 20) {
      upDown = 0;
    } else if (random < 25) {
      upDown = -1;
    } else if (random < 30) {
      upDown = -1.5;
    } else if (random < 35) {
      upDown = -2;
    }
    if (this.player.speed < 250) {
      this.player.speed += 1;
    }
    this.updatePlayerControls();
    this.devilsAndProductY = this.devilsAndProductY + 100 * upDown;
    let x = this.player.x + 700;
    let y = this.devilsAndProductY;
    if (y < 100) {
      y += 225;
      this.devilsAndProductY = y;
    } else if (y > 800) {
      y -= 225;
      this.devilsAndProductY = y;
    }

    this.generateDevil(x, y);
    this.generateProduct(x, y + 150);
    this.generateDevil(x, y + 300);
  }
  generateDevil(x, y) {
    let devilX = x;
    let devilY = y;

    const devil = this.physics.add
      .sprite(devilX, devilY, "devil1")
      .setScrollFactor(1, 0)
      .setDepth(2)
      .setScale(0.2);
    // .setCircle(150, 100, 100);
    devil.play("devilAnimation");
    devil.setGravity(0);
    devil.setVelocityX(0);
    this.devils.push(devil);

    const devilCollide = this.physics.add
      .sprite(devilX, devilY, "devil1")
      .setScrollFactor(1, 0)
      .setDepth(1)
      .setScale(0.1)
      .setCircle(300, -50, -30);
    devilCollide.setGravity(0);
    devilCollide.setVelocityX(0);
    this.devilCollides.push(devilCollide);

    this.physics.add.overlap(this.player, devilCollide, () => {
      if (!this.player.lost) {
        devilCollide.destroy();
        this.pointTimes = 1;
        this.life -= 1;
        this.updateLives();
        this.devilTween(devil);
      }
    });
  }
  devilTween(devil) {
    this.tweens.add({
      targets: devil,
      scaleX: 1, // Increase width
      scaleY: 1, // Increase height
      alpha: 0, // Decrease visibility to fully transparent
      duration: 500, // 1 second for the scaling and fade-out effect
      ease: "Power1", // Easing function for smooth transition
      onComplete: () => {
        // Step 2: Destroy the hoop after the animation completes
        devil.destroy();
      },
    });
  }
  generateProduct(x, y) {
    let productX = x;
    let productY = y;

    let productImage = `product${this.randomBetween(1, 3)}`;
    const product = this.physics.add
      .sprite(productX, productY, productImage)
      .setScrollFactor(1, 0)
      .setDepth(2)
      .setScale(0.6);
    product.setGravity(0);
    product.setVelocityX(0);
    this.products.push(product);

    const productCollide = this.physics.add
      .sprite(productX, productY, productImage)
      .setScrollFactor(1, 0)
      .setDepth(1)
      .setScale(0.6);
    productCollide.setGravity(0);
    productCollide.setVelocityX(0);
    this.productCollides.push(productCollide);

    this.physics.add.overlap(this.player, productCollide, () => {
      if (!this.player.lost) {
        if (this.soundOn) {
          this.productSound.play();
        }
        productCollide.destroy();
        this.productTween(product);
        let pointAddText = this.add
          .text(productCollide.x, productCollide.y, `+${this.pointTimes}`, {
            fontSize: "34px",
            color: "#7b46bb",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
          .setDepth(3);
        let pointTImes = this.pointTimes;
        this.tweens.add({
          targets: pointAddText,
          x: this.player.x + this.player.speed - 100,
          y: 50,
          ease: "Power1",
          duration: 500,
          delay: 200,
          onComplete: () => {
            pointAddText.destroy();
            this.score += pointTImes;
            this.pointTimes += 1;
          },
        });
      }
    });
  }
  productTween(devil) {
    this.tweens.add({
      targets: devil,
      scaleX: 1.5, // Increase width
      scaleY: 1.5, // Increase height
      alpha: 0, // Decrease visibility to fully transparent
      duration: 500, // 1 second for the scaling and fade-out effect
      ease: "Power1", // Easing function for smooth transition
      onComplete: () => {
        // Step 2: Destroy the hoop after the animation completes
        devil.destroy();
      },
    });
  }

  notify(code) {
    let message, x, y;

    if (code === 1) {
      message = "Enter your username!";

      x = 400;
      y = 100;
    } else if (code === 2) {
      message = "Invalid email!";

      x = 400;
      y = 100;
    } else if (code === 3) {
      message = "Username already taken!";

      x = 400;
      y = 100;
    } else if (code === 4) {
      message = "User removed sucessfully";

      x = 400;
      y = 40;
    } else if (code === 5) {
      message = "Code copied to clipboard";

      x = 400;
      y = 365;
    } else if (code === 6) {
      message = "Code copied to clipboard";

      x = 400;
      y = 890;
    }

    const notificationText = this.add
      .text(x, y, message, {
        fontFamily: "RakeslyRG",
        fontSize: "35px",
        color: "#f20071",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0)
      .setDepth(Infinity);

    this.tweens.add({
      targets: notificationText,
      alpha: 1,
      duration: 200,

      onComplete: () => {
        this.time.addEvent({
          delay: 1000,

          callback: () => {
            this.tweens.add({
              targets: notificationText,
              alpha: 0,
              duration: 200,

              onComplete: () => {
                notificationText.destroy();
              },
            });
          },
        });
      },
    });
  }
  randomBetween(min, max) {
    return Phaser.Math.Between(min, max);
  }

  update() {
    if (this.playing) {
      this.updateScore();
      this.updateCameraBounds();
      this.checkPlayerLost();
    }
  }
  updatePlayerControls() {
    if (!this.player.lost) {
      this.player.setVelocityX(this.player.speed);
      this.leftWall.setVelocityX(this.player.speed);
    }
  }
  updateCameraBounds() {
    if (this.player) {
      if (!this.player.lost) {
        this.cameraBound = this.player.x - 200;
        // this.cameraBound = 100;
        this.cameras.main.setBounds(this.cameraBound, 0, 1200, 0, true);
      }
    }
  }
  checkPlayerLost() {
    if (this.player && !this.player.lost) {
      if (this.player.y > 1200 || this.player.y < 0 || this.life == 0) {
        this.player.lost = true;
      }
    }

    if (this.player && this.player.lost && !this.player.ended) {
      this.player.ended = true;

      this.sound.stopAll();

      if (this.soundOn) {
        this.lostSound.play();
      }

      this.time.addEvent({
        delay: 1000,

        callback: () => {
          this.cameras.main.fadeOut(500);

          this.time.addEvent({
            delay: 1000,

            callback: () => {
              this.tempHighScore = this.highScore;

              if (this.score > this.highScore) {
                this.highScore = this.score;
              }

              localStorage.setItem("axa-bird-game-highScore", this.highScore);

              localStorage.setItem("axa-bird-game-score", this.score);

              this.playing = false;

              console.log(this.remember, this.score);

              if (this.score > 0) {
                if (this.remember) {
                  this.socket.emit(
                    "scoreUpdate",
                    {
                      username: this.username,
                      email: this.email,
                      score: this.score,
                      news: this.news,
                    },
                    (unlocked) => {
                      if (unlocked) {
                        this.unlocked = unlocked;
                        this.screen = "unlocked";
                        this.scene.restart();
                      } else {
                        this.screen = "replay";
                        this.scene.restart();
                      }
                    }
                  );
                } else {
                  this.screen = "restart";
                  this.scene.restart();
                }
              } else {
                this.screen = "replay";
                this.scene.restart();
              }
            },
          });
        },
      });
    }
  }
  updateScore() {
    if (this.scoreText) {
      this.scoreText.setText(this.score);
    }
  }
  updateLives() {
    this.lifes[this.life].destroy();
  }
}

const game = new Phaser.Game({
  parent: "game",
  type: Phaser.AUTO,
  width: 800,
  height: 1200,
  border: 2,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true,
  },
  input: {
    activePointers: 3,
  },
  scene: [Game],
});

window.oncontextmenu = (event) => {
  event.preventDefault();
};

console.warn = () => {
  return false;
};
