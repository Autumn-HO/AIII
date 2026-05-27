const app = document.querySelector("#app");
const introTemplate = document.querySelector("#intro-template");

const correctConference = "AIII";
const brandFullName = "Academic Illusion & Inference Institute";
const brandChineseName = "学术幻觉与审稿玄学研究所";

const stages = [
  {
    id: "conference",
    title: "你要投哪个会？",
    label: "1",
    choices: ["AIIl", "AIlI", "AlII", "AllI", "AIII"],
  },
  {
    id: "submit",
    title: "点下 Submit 的那一刻，你心里想的是：",
    label: "2",
    choices: [
      "能打开就行",
      "先交，后面的交给 reviewer",
      "这版应该比上一版像论文",
      "我已经不敢再看 PDF 了",
    ],
  },
  {
    id: "waiting",
    title: "投稿后这几天，你的状态是：",
    label: "3",
    choices: [
      "每天刷一下，主打一个随缘但频繁",
      "群里有人说有动静，我立刻打开网页",
      "假装忘了，其实看到邮箱就紧张",
      "已经在想如果不中投哪里",
    ],
  },
  {
    id: "reviews",
    title: "评审出来那一刻，你第一眼先看：",
    label: "4",
    choices: ["分数", "confidence", "最长的那条 review", "有没有 reviewer 说 however"],
  },
  {
    id: "updates",
    title: "过了几天，页面又更新了，你觉得最像：",
    label: "5",
    choices: [
      "有人改了字，但没改分",
      "有人补了一句，但像没补",
      "有新评论，但我看不懂它想干嘛",
      "状态没变，但我变了",
    ],
  },
  {
    id: "rebuttal",
    title: "response deadline 前，你最后改的是：",
    label: "6",
    choices: ["把语气再软一点", "把 limitation 写得像 feature", "删掉一句像吵架的话", "把 claim 收回到能防守的范围"],
  },
  {
    id: "reply",
    title: "rebuttal 交完后，你最怕看到：",
    label: "7",
    choices: ["thanks", "concerns remain", "no response", "new concern"],
  },
  {
    id: "decision",
    title: "开奖前最后一分钟，你在干嘛：",
    label: "8",
    choices: ["刷新网页", "看群里有没有人报喜", "打开邮箱又关掉", "已经查好下一会 ddl"],
  },
];

const reviewerTypes = [
  {
    name: "Who is Adam 型",
    tag: "基础常识误判",
    line: "The authors use Adam, but it is unclear who Adam is.",
    truth: "optimizer 被当成 co-author，method section 当场开始补课。",
    bias: -2,
  },
  {
    name: "我有四十个问题型",
    tag: "问题轰炸",
    line: "I have 40 concerns and 40 questions. Please respond point by point.",
    truth: "这不是 rebuttal，是 supplementary 的现场扩建。",
    bias: -2,
  },
  {
    name: "However 开门杀型",
    tag: "礼貌刀法",
    line: "The paper is interesting, however, the contribution is limited.",
    truth: "positive summary 负责铺垫，however 负责真正审稿。",
    bias: -1,
  },
  {
    name: "Baseline 追债型",
    tag: "对比实验",
    line: "The authors should compare with one more very relevant baseline.",
    truth: "你补一个 baseline，他想起另一个 benchmark。",
    bias: -1,
  },
  {
    name: "Confidence 5 路过型",
    tag: "自信路人",
    line: "I am confident in my assessment.",
    truth: "confidence 拉满，evidence 省略。OpenReview 只负责显示数字。",
    bias: 0,
  },
  {
    name: "三行半 review 型",
    tag: "短评震撼",
    line: "The idea is nice. Experiments are okay. Concerns remain.",
    truth: "三行 review，二十页 revision plan。",
    bias: -1,
  },
  {
    name: "Thanks 但不改分型",
    tag: "礼貌不动",
    line: "Thanks for the clarification. I keep my score unchanged.",
    truth: "response 被 acknowledge 了，rating 没有被 address。",
    bias: -1,
  },
  {
    name: "新增 concern 型",
    tag: "支线任务",
    line: "After reading the response, I have an additional concern.",
    truth: "rebuttal 没有 close issue，只是开了一个新 thread。",
    bias: -2,
  },
  {
    name: "消失型",
    tag: "已读不回",
    line: "No further comment.",
    truth: "discussion 区保持安静，作者脑内已经开了三轮组会。",
    bias: 0,
  },
  {
    name: "故事买账型",
    tag: "短暂同频",
    line: "The framing is clear, and the empirical evidence supports the main claim.",
    truth: "他真的买了你的 story，甚至没有要求重写 introduction。",
    bias: 2,
  },
  {
    name: "实验够用型",
    tag: "少见好运",
    line: "The experiments are sufficient for supporting the paper's central argument.",
    truth: "baseline 没继续膨胀，ablation 也没有被追到天亮。",
    bias: 2,
  },
  {
    name: "AC 通灵型",
    tag: "Meta-review 调和",
    line: "The discussion was constructive, but concerns remain.",
    truth: "AC 把分歧写成建设性讨论，作者把建设性翻译成没戏。",
    bias: -1,
  },
  {
    name: "懂你型",
    tag: "短暂同频",
    line: "The response addresses my main concern. I am willing to raise my score.",
    truth: "main concern 真的被 addressed，这句一般只在梦里出现。",
    bias: 2,
  },
];

const decisions = [
  {
    name: "Phase 1 Reject",
    signal: "Two negative Phase 1 reviews",
    presentation: "",
    route: "Phase 1",
    range: [-999, 9],
    scores: [2, 3, 4],
    show: "这篇甚至没有活到完整 discussion，Phase 1 就被系统送走了。",
    effect: "author response 还没排上号，transfer plan 已经开始加载。",
    truth: "novelty 没站住，evaluation 没兜住，confidence 反而很稳。",
  },
  {
    name: "Reject",
    signal: "Below acceptance bar",
    presentation: "",
    route: "Full Review",
    range: [10, 15],
    scores: [3, 4, 5],
    show: "review 里有 positive words，decision 里没有 positive outcome。",
    effect: "interesting 负责安慰你，below the bar 负责结束你。",
    truth: "分数像能争取，meta-review 像已经排好队形。",
  },
  {
    name: "Reject",
    signal: "Borderline discussion",
    presentation: "",
    route: "Full Review",
    range: [16, 22],
    scores: [4, 5, 6],
    show: "你离 Accept 很近，近到 AC 写一句 concerns remain 就能把人送回 Overleaf。",
    effect: "reviewer signal 是 borderline，final decision 是别再幻想。",
    truth: "不是没机会，是机会被写进了 but 后面。",
  },
  {
    name: "Accept",
    signal: "Cleared acceptance bar",
    presentation: "Poster",
    route: "Conference Presentation",
    range: [23, 29],
    scores: [5, 6, 7],
    show: "不是所有 reviewer 都爱你，但 acceptance bar 这次没有突然移动。",
    effect: "你被接收了，展示形式是 Poster。系统给你留了块板，也留了点体面。",
    truth: "novelty 没被拆穿，baseline 没被追死，AC 没临门一脚补刀。",
  },
  {
    name: "Accept",
    signal: "Positive discussion",
    presentation: "Spotlight",
    route: "Conference Presentation",
    range: [30, 34],
    scores: [6, 7, 8],
    show: "reviewer 没有全票爱你，但讨论区终于没有继续长出新 concern。",
    effect: "Final Decision 是 Accept，Presentation 是 Spotlight。你被安排短暂发光，然后立刻回去改 camera-ready。",
    truth: "不是所有 weakness 都消失了，是 AC 觉得剩下的问题还不足以把你按回去。",
  },
  {
    name: "Accept",
    signal: "High-support accepted paper",
    presentation: "Oral",
    route: "Conference Presentation",
    range: [30, 36],
    scores: [7, 8, 9],
    show: "reviewer、AC、program slot 短暂使用了同一套评价标准。",
    effect: "Final Decision 是 Accept，Presentation 是 Oral。你不只是中了，你还要上台解释。",
    truth: "strong points 没被 however 吃掉，weaknesses 也没有无限增殖。",
  },
  {
    name: "Accept",
    signal: "Award-track candidate",
    presentation: "Best Paper Candidate",
    route: "Award Track",
    range: [37, 999],
    scores: [8, 9, 10],
    show: "这不是单纯录用，这是 AC 没把 strong support 写丢的罕见时刻。",
    effect: "Accept 之后又多了一个 badge：Best Paper Candidate。学术系统短暂没有掉线。",
    truth: "novelty 没被拆，baseline 没被追债，AC 还真的读了 discussion。",
  },
];

const metaReviews = {
  "Phase 1 Reject": [
    "Reviewers agree that the submission is not ready for acceptance.",
    "The concerns are substantial and were not sufficiently addressed.",
  ],
  Reject: [
    "Although the paper has merits, the concerns remain significant.",
    "The discussion was constructive, but the paper falls below the acceptance bar.",
  ],
  Accept: [
    "Reviewers are generally positive, and the response addressed the key concerns.",
    "The paper clears the acceptance bar with solid support from the reviews.",
  ],
};

const transitionMessages = {
  conference: ["AIII 已识别", "进系统"],
  submit: ["提交成功", "等分配"],
  waiting: ["有动静", "开分"],
  reviews: ["review 已出", "先别慌"],
  updates: ["讨论区更新", "分数先别信"],
  rebuttal: ["response 已交", "等回复"],
  reply: ["还在 pending", "等开奖"],
  decision: ["结果已封存", "开"],
};

const stageNames = ["选会", "Submit", "等动静", "开分", "讨论", "Rebuttal", "等回信", "开奖"];

const stageDetails = [
  { phase: "投稿", status: "投稿入口确认" },
  { phase: "投稿", status: "PDF 进系统" },
  { phase: "等审", status: "刷网页但随缘" },
  { phase: "等审", status: "开分先深呼吸" },
  { phase: "等审", status: "讨论区有动静" },
  { phase: "Rebuttal", status: "逐条回到失语" },
  { phase: "Rebuttal", status: "等一句 thanks" },
  { phase: "开奖", status: "decision pending" },
];

const majorStages = ["投稿", "等审", "Rebuttal", "开奖"];

const state = {
  started: false,
  step: 0,
  answers: [],
  seedSalt: Math.floor(Math.random() * 1000000),
  deskChoice: "",
  reviewPacket: null,
  reviewResponseIndex: 0,
  result: null,
};

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleMany(items, count, random) {
  const pool = [...items];
  const result = [];
  while (pool.length && result.length < count) {
    const index = Math.floor(random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}

function shuffleScores(scores, random) {
  return [...scores].sort(() => random() - 0.5);
}

function normalRandom(random) {
  const u1 = Math.max(random(), Number.EPSILON);
  const u2 = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function decisionForZ(z) {
  if (z < -1.65) {
    return decisions[0];
  }
  if (z < -0.85) {
    return decisions[1];
  }
  if (z < -0.37) {
    return decisions[2];
  }
  if (z < 0.75) {
    return decisions[3];
  }
  if (z < 1.35) {
    return decisions[4];
  }
  if (z < 1.85) {
    return decisions[5];
  }
  return decisions[6];
}

function initialReviewScore(random, answerTilt, reviewerBias) {
  const z = normalRandom(random) + answerTilt * 0.03 + reviewerBias * 0.28;
  if (z < -1.7) return 2;
  if (z < -1.1) return 3;
  if (z < -0.45) return 4;
  if (z < 0.25) return 5;
  if (z < 0.85) return 6;
  if (z < 1.35) return 7;
  if (z < 1.75) return 8;
  if (z < 2.15) return 9;
  return 10;
}

function decisionForAverageScore(averageScore) {
  if (averageScore < 3.4) {
    return decisions[0];
  }
  if (averageScore < 4.8) {
    return decisions[1];
  }
  if (averageScore < 6.2) {
    return decisions[2];
  }
  if (averageScore < 7.5) {
    return decisions[3];
  }
  if (averageScore < 8.2) {
    return decisions[4];
  }
  if (averageScore < 9.1) {
    return decisions[5];
  }
  return decisions[6];
}

function slugifyDecision(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function renderIntro() {
  const content = introTemplate.content.cloneNode(true);
  app.replaceChildren(content);
  app.querySelector('[data-action="start"]').addEventListener("click", startQuiz);
  app.querySelector('[data-action="random"]').addEventListener("click", randomResult);
  resetScroll();
}

function startQuiz() {
  state.started = true;
  state.step = 0;
  state.answers = [];
  state.deskChoice = "";
  state.reviewPacket = null;
  state.reviewResponseIndex = 0;
  state.result = null;
  state.seedSalt = Math.floor(Math.random() * 1000000);
  renderQuiz();
}

function renderQuiz() {
  const stage = stages[state.step];
  const stageDetail = stageDetails[state.step];
  const isConference = stage.id === "conference";
  app.innerHTML = `
    <section class="quiz-shell">
      <div class="quiz-card stage-card-${stage.id} ${isConference ? "conference-card" : ""}">
        ${renderSurvivalProgress(state.step)}
        <div class="question-area">
          <div class="question-head">
            <span>${stageDetail.phase}</span>
            <b>${stageDetail.status}</b>
          </div>
          <h2>${stage.title}</h2>
          <div class="choices">
            ${stage.choices
              .map(
                (choice, index) => `
                <button class="choice-btn ${isConference ? "conference-choice" : ""}" data-choice="${escapeHtml(choice)}">
                  <span>${String.fromCharCode(65 + index)}</span>
                  <strong>${isConference ? `<span class="conference-code">${choice}</span>` : choice}</strong>
                </button>
              `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;

  app.querySelectorAll(".choice-btn").forEach((button) => {
    button.addEventListener("click", () => chooseOption(button.dataset.choice));
  });
  resetScroll();
}

function chooseOption(choice) {
  const stage = stages[state.step];
  if (stage.id === "conference" && choice !== correctConference) {
    state.deskChoice = choice;
    renderDeskReject(choice);
    return;
  }

  state.answers.push({ stage: stage.id, choice });
  if (stage.id === "reviews") {
    state.reviewPacket = buildReviewPacket();
    state.reviewResponseIndex = 0;
    state.step += 1;
    renderReviewReveal(renderQuiz);
    return;
  }

  if (stage.id === "updates") {
    state.step += 1;
    renderTransition(stage.id, () => renderReviewerResponse(0));
    return;
  }

  if (state.step === stages.length - 1) {
    renderTransition(stage.id, () => {
      state.result = buildResult();
      renderResult();
    }, true);
    return;
  }
  state.step += 1;
  renderTransition(stage.id, renderQuiz);
}

function renderTransition(stageId, next, isFinal = false) {
  const messages = transitionMessages[stageId] || ["please wait..."];
  const survivedIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === stageId),
  );
  const nextIndex = Math.min(survivedIndex + 1, stages.length - 1);
  app.innerHTML = `
    <section class="transition-shell">
      <div class="transition-card">
        ${renderSurvivalProgress(survivedIndex)}
        <span class="survival-kicker">已活到 ${stageDetails[survivedIndex].phase} / ${stageNames[survivedIndex]}</span>
        <p>${messages[0]}</p>
        <strong>${messages[1] || "继续"}</strong>
        <em>${isFinal ? "下一步：开奖" : `下一关：${stageDetails[nextIndex].phase} / ${stageNames[nextIndex]}`}</em>
        <button class="primary-btn transition-next" data-action="continue">
          ${isFinal ? "打开 Decision" : "继续"}
        </button>
      </div>
    </section>
  `;
  resetScroll();
  app.querySelector('[data-action="continue"]').addEventListener("click", next);
}

function renderReviewReveal(next) {
  const packet = state.reviewPacket || buildReviewPacket();
  const focus = state.answers.find((answer) => answer.stage === "reviews")?.choice || "review";
  app.innerHTML = `
    <section class="review-reveal-shell">
      <article class="review-reveal-card">
        ${renderSurvivalProgress(3)}
        <div class="review-reveal-head">
          <span>Initial Reviews Released</span>
          <h2>${packet.scores.join(" / ")}</h2>
          <p>${reviewFocusCopy(focus)}</p>
        </div>
        <div class="review-reveal-grid">
          ${packet.reviewers
            .map(
              (reviewer, index) => `
              <section class="review-peek-card">
                <div class="review-peek-top">
                  <span>R${index + 1}</span>
                  <b>${reviewer.rating}</b>
                </div>
                <h3>${reviewer.name}</h3>
                <em>Confidence ${reviewer.confidence} · ${reviewer.tag}</em>
                <p>${reviewer.line}</p>
              </section>
            `,
            )
            .join("")}
        </div>
        <div class="review-reveal-actions">
          <button class="primary-btn" data-action="continue">进入 Discussion</button>
        </div>
      </article>
    </section>
  `;
  resetScroll();
  app.querySelector('[data-action="continue"]').addEventListener("click", next);
}

function renderReviewerResponse(index) {
  const packet = state.reviewPacket || buildReviewPacket();
  const reviewer = packet.reviewers[index];
  const options = responseOptionsFor(reviewer);
  state.reviewResponseIndex = index;
  app.innerHTML = `
    <section class="review-response-shell">
      <article class="review-response-card">
        ${renderSurvivalProgress(5)}
        <div class="response-head">
          <span>Response to Reviewer ${index + 1}</span>
          <h2>${reviewer.name}</h2>
          <p>${reviewer.line}</p>
          <div class="response-meta">
            <b>Rating ${reviewer.rating}</b>
            <b>Confidence ${reviewer.confidence}</b>
            <b>${reviewer.tag}</b>
          </div>
        </div>
        <div class="response-choices">
          ${options
            .map(
              (option, optionIndex) => `
              <button class="choice-btn response-choice" data-option="${optionIndex}">
                <span>${String.fromCharCode(65 + optionIndex)}</span>
                <strong>${option.label}</strong>
              </button>
            `,
            )
            .join("")}
        </div>
      </article>
    </section>
  `;
  resetScroll();
  app.querySelectorAll(".response-choice").forEach((button) => {
    button.addEventListener("click", () => chooseReviewerResponse(index, Number(button.dataset.option)));
  });
}

function chooseReviewerResponse(index, optionIndex) {
  const packet = state.reviewPacket || buildReviewPacket();
  const reviewer = packet.reviewers[index];
  const option = responseOptionsFor(reviewer)[optionIndex];
  state.answers.push({
    stage: `response-r${index + 1}`,
    choice: option.label,
    reviewer: reviewer.name,
    trap: option.trap,
  });

  if (option.trap) {
    renderReviewTrapReject(reviewer, option, index);
    return;
  }

  if (index < packet.reviewers.length - 1) {
    renderReviewerResponse(index + 1);
    return;
  }

  renderReviewDoneTransition(renderQuiz);
}

function responseOptionsFor(reviewer) {
  const options = [
    {
      label: "先承认 concern，再把证据压到能读完的一段里",
      trap: false,
    },
    {
      label: "补一句 limitation，但不主动扩大攻击面",
      trap: false,
    },
    {
      label: "把 rebuttal 写成 checklist，逐条对齐 reviewer 原话",
      trap: false,
    },
  ];
  const trapIndex = hashString(`${state.seedSalt}|${reviewer.name}|trap`) % (options.length + 1);
  options.splice(trapIndex, 0, reviewerTrapOption(reviewer));
  return options;
}

function reviewerTrapOption(reviewer) {
  const name = reviewer.name;
  if (name.includes("Who is Adam")) {
    return {
      label: "写：Adam 不是人，这个问题不成立",
      trap: true,
      verdict: "AC 表示技术上你是对的，但 rebuttal 语气上你已经没了。",
    };
  }
  if (name.includes("四十")) {
    return {
      label: "回复：问题太多，篇幅有限，详见原文",
      trap: true,
      verdict: "四十个问题没有消失，只是全部变成了 unresolved concerns。",
    };
  }
  if (name.includes("However")) {
    return {
      label: "只感谢 interesting，完全跳过 however",
      trap: true,
      verdict: "reviewer 的 however 被你无视后，在 discussion 区长成了 decision。",
    };
  }
  if (name.includes("Baseline")) {
    return {
      label: "说这个 baseline 不 relevant，但不给证据",
      trap: true,
      verdict: "baseline 没跑，理由也没站住，AC 帮你把 bar 往上挪了一格。",
    };
  }
  if (name.includes("Confidence")) {
    return {
      label: "质疑 reviewer 为什么 confidence 这么高",
      trap: true,
      verdict: "你问出了大家都想问的问题，也问没了这篇 paper。",
    };
  }
  if (name.includes("三行半")) {
    return {
      label: "也回三行：thanks, concerns addressed",
      trap: true,
      verdict: "短评遇上短回复，最后只有 decision letter 变长了。",
    };
  }
  if (name.includes("Thanks")) {
    return {
      label: "继续追问：那为什么 score unchanged",
      trap: true,
      verdict: "你试图开启第二轮 rebuttal，系统提醒你这里不是 chat room。",
    };
  }
  if (name.includes("新增 concern")) {
    return {
      label: "指出 new concern 不该出现在 rebuttal 后",
      trap: true,
      verdict: "道理你有，decision 权限你没有。",
    };
  }
  if (name.includes("消失")) {
    return {
      label: "在 discussion 里连续 @ reviewer 三次",
      trap: true,
      verdict: "reviewer 没回来，AC 先来了。",
    };
  }
  return {
    label: "趁机把 claim 扩大到整个领域",
    trap: true,
    verdict: "reviewer 刚想支持你，你自己把 contribution 写成了 attack surface。",
  };
}

function renderReviewTrapReject(reviewer, option, index) {
  app.innerHTML = `
    <section class="desk-card review-trap-card">
      <span class="desk-badge">AC Intervention</span>
      <h2>Reject</h2>
      <p>R${index + 1} 是 <strong>${reviewer.name}</strong>。</p>
      <div class="trap-choice">
        <span>你写进 response 的句子</span>
        <strong>${option.label}</strong>
      </div>
      <p>${option.verdict}</p>
      <p>Meta-review：The author response introduced additional concerns during discussion.</p>
      <div class="hero-actions">
        <button class="primary-btn" data-action="again">重新投一轮</button>
        <button class="ghost-btn" data-action="home">回到首页</button>
      </div>
    </section>
  `;
  app.querySelector('[data-action="again"]').addEventListener("click", startQuiz);
  app.querySelector('[data-action="home"]').addEventListener("click", renderIntro);
  resetScroll();
}

function renderReviewDoneTransition(next) {
  app.innerHTML = `
    <section class="transition-shell">
      <div class="transition-card">
        ${renderSurvivalProgress(5)}
        <span class="survival-kicker">已活到 Rebuttal / R1-R3</span>
        <p>三位 reviewer 都回完了</p>
        <strong>Response 合并中</strong>
        <em>下一关：Rebuttal / deadline 前最后检查</em>
        <button class="primary-btn transition-next" data-action="continue">继续</button>
      </div>
    </section>
  `;
  resetScroll();
  app.querySelector('[data-action="continue"]').addEventListener("click", next);
}

function reviewFocusCopy(focus) {
  const copy = {
    分数: "你先看了分数。很好，现在大脑会自动把每个字都解释成录用概率。",
    confidence: "你先看了 confidence。很合理，毕竟有些低分比高分还自信。",
    "最长的那条 review": "你先看了最长的 review。它通常不只是意见，是一份待办清单。",
    "有没有 reviewer 说 however": "你先找 however。学术训练的尽头，是对转折词的条件反射。",
  };
  return copy[focus] || "reviews 已经出现，后面的每一步都开始有了具体攻击来源。";
}

function renderSurvivalProgress(activeIndex) {
  const currentPhase = stageDetails[activeIndex].phase;
  const currentMajorIndex = majorStages.indexOf(currentPhase);
  return `
    <div class="progress-wrap">
      <div class="progress-meta survival-meta">
        <span>已活到</span>
        <strong>${currentPhase}</strong>
        <em>${stageNames[activeIndex]}</em>
        <b>${activeIndex + 1} / ${stages.length}</b>
      </div>
      <div class="progress-bar" aria-hidden="true">
        <div class="progress-fill progress-step-${activeIndex}"></div>
      </div>
      <div class="major-rail" aria-label="overall progress">
        ${majorStages
        .map(
          (name, index) => `
            <span class="${index < currentMajorIndex ? "done" : ""} ${index === currentMajorIndex ? "current" : ""}">
              <i>${name}</i>
            </span>
          `,
        )
        .join("")}
      </div>
    </div>
  `;
}

function renderDeskReject(choice) {
  app.innerHTML = `
    <section class="desk-card">
      <span class="desk-badge">会议简称识别失败</span>
      <h2>Desk Reject</h2>
      <p>你点到的是 <strong class="confusable-word">${escapeHtml(choice)}</strong>。</p>
      <div class="spell-check">
        <span>系统拆开看</span>
        <strong>${spellConference(choice)}</strong>
      </div>
      <div class="spell-check correct">
        <span>正确会议名</span>
        <strong>${spellConference(correctConference)}</strong>
      </div>
      <p>最后确认：AIII 是四个大写字母。刚刚混进去的是小写 l。</p>
      <div class="hero-actions">
        <button class="primary-btn" data-action="retry">重新看一眼</button>
        <button class="ghost-btn" data-action="home">回到首页</button>
      </div>
    </section>
  `;
  app.querySelector('[data-action="retry"]').addEventListener("click", () => {
    state.step = 0;
    renderQuiz();
  });
  app.querySelector('[data-action="home"]').addEventListener("click", renderIntro);
  resetScroll();
}

function spellConference(value) {
  return [...value]
    .map((letter) => {
      const className = letter === "l" ? "letter wrong-letter" : "letter";
      return `<span class="${className}">${escapeHtml(letter)}</span>`;
    })
    .join("");
}

function randomResult() {
  state.answers = stages.slice(1).map((stage) => ({
    stage: stage.id,
    choice: stage.choices[Math.floor(Math.random() * stage.choices.length)],
  }));
  state.seedSalt = Math.floor(Math.random() * 1000000);
  state.reviewPacket = buildReviewPacket();
  state.result = buildResult();
  renderResult();
}

function buildReviewPacket() {
  const answerKey = state.answers.map((answer) => `${answer.stage}:${answer.choice}`).join("|");
  const seed = hashString(`reviews|${answerKey}|${state.seedSalt}`);
  const random = mulberry32(seed);
  const answerTilt = state.answers.reduce((total, answer, index) => {
    return total + ((hashString(`${answer.choice}:${index}`) % 5) - 2);
  }, 0);
  const reviewers = sampleMany(reviewerTypes, 3, random);
  const scores = reviewers.map((reviewer) => initialReviewScore(random, answerTilt, reviewer.bias));
  const averageScore = scores.reduce((total, score) => total + score, 0) / scores.length;
  const preliminaryDecision = decisionForAverageScore(averageScore);
  const reviewerCards = reviewers.map((reviewer, index) => ({
    ...reviewer,
    rating: scores[index],
    confidence: 1 + Math.floor(random() * 5),
  }));

  return {
    seed,
    preliminaryDecision,
    scores,
    reviewers: reviewerCards,
  };
}

function buildResult() {
  if (!state.reviewPacket) {
    state.reviewPacket = buildReviewPacket();
  }

  const answerKey = state.answers.map((answer) => `${answer.stage}:${answer.choice}`).join("|");
  const seed = hashString(`${answerKey}|${state.seedSalt}`);
  const random = mulberry32(seed);
  const answerTilt = state.answers.reduce((total, answer, index) => {
    return total + ((hashString(`${answer.choice}:${index}`) % 5) - 2);
  }, 0);
  const preliminaryZ = normalRandom(random) + answerTilt * 0.04;
  const reviewers = state.reviewPacket.reviewers;
  const reviewerInfluence = reviewers.reduce((total, reviewer) => total + reviewer.bias, 0);
  const initialAverage =
    state.reviewPacket.scores.reduce((total, score) => total + score, 0) / state.reviewPacket.scores.length;
  const initialScoreTilt = (initialAverage - 5) * 0.24;
  const finalZ = preliminaryZ + initialScoreTilt + reviewerInfluence * 0.06 + normalRandom(random) * 0.14;
  const decision = decisionForZ(finalZ) || decisions[2];
  const scores = shuffleScores(decision.scores, random);
  const reviewerCards = reviewers.map((reviewer, index) => ({
    ...reviewer,
    rating: scores[index],
    confidence: reviewer.confidence,
  }));
  const metaPool = metaReviews[decision.name] || metaReviews.Reject;
  const meta = metaPool[Math.floor(random() * metaPool.length)];
  const persona = buildPersona(decision, reviewerCards, scores);

  return {
    seed,
    decision,
    scores,
    reviewers: reviewerCards,
    meta,
    persona,
  };
}

function buildPersona(decision, reviewers, scores) {
  const names = reviewers.map((reviewer) => reviewer.name).join("|");
  const presentationLabel = formatPresentation(decision);
  let title = decision.presentation ? `Accept / ${presentationLabel}` : decision.name;
  let subtitle = decision.effect;
  let caption = decision.presentation
    ? `我在 AIII 抽到了 ${decision.name}，Presentation 是 ${presentationLabel}。`
    : `我在 AIII 抽到了 ${decision.name}，review route 是 ${decision.route}。`;

  if (decision.presentation === "Best Paper Candidate") {
    title = "Accept / Best Paper Candidate";
    subtitle = "不是 final decision 升级，是 Accept 后又被 AC 标了个 candidate。";
    caption = "我在 AIII 抽到了 Accept + Best Paper Candidate：meta-review 里没有 but，discussion 没长出新 concern。";
  } else if (decision.presentation === "Oral") {
    title = "Accept / Oral";
    subtitle = "中了，但还要上台公开解释 reviewer 2 到底想问什么。";
    caption = "我在 AIII 抽到了 Accept / Oral：不是强录用，是录用之后被安排上台。";
  } else if (decision.presentation === "Spotlight") {
    title = "Accept / Spotlight";
    subtitle = "不是全场最佳，但足够被放到灯下短暂展示。";
    caption = "我在 AIII 抽到了 Accept / Spotlight：reviewer 没全懂，但 AC 决定让大家也来听一下。";
  } else if (decision.presentation === "Poster") {
    title = "Accept / Poster";
    subtitle = "过了 bar，拿到 poster 位，终于可以把 rebuttal 写成段子。";
    caption = "我在 AIII 抽到了 Accept / Poster：bar 没突然移动，AC 没临门补刀。";
  } else if (decision.signal === "Borderline discussion") {
    title = "Borderline Reject";
    subtitle = "review signal 像能活，final decision 说别幻想。";
    caption = "我在 AIII 抽到了 Borderline Reject：分数在边缘，but 在天上。";
  } else if (decision.name === "Phase 1 Reject") {
    title = "Phase 1 未解锁";
    subtitle = "还没轮到完整 discussion，transfer plan 已经亮了。";
    caption = "我在 AIII 抽到了 Phase 1 Reject：reviewer 很一致，一致地不想讨论。";
  } else if (names.includes("我有四十个问题")) {
    title = "Reviewer 工单中心";
    subtitle = "40 concerns 不是 review，是 rebuttal 压测。";
    caption = "我在 AIII 抽到了 Reviewer 工单中心：一封 response 写出了 supplementary 的体量。";
  } else if (names.includes("Who is Adam")) {
    title = "Optimizer 证件照型";
    subtitle = "Adam 从 optimizer 变成身份不明对象。";
    caption = "我在 AIII 抽到了 Optimizer 证件照型：method section 临时承担科普义务。";
  } else if (names.includes("However")) {
    title = "However 开门杀";
    subtitle = "positive summary 只是热身，真正的 decision 在 however 后面。";
    caption = "我在 AIII 抽到了 However 开门杀：前半句像鼓励，后半句像 meta-review。";
  } else if (names.includes("Thanks 但不改分")) {
    title = "Score Unchanged 型";
    subtitle = "response 被 acknowledge，rating 原地踏步。";
    caption = "我在 AIII 抽到了 Score Unchanged 型：thanks 很礼貌，score 很冷静。";
  } else if (names.includes("新增 concern")) {
    title = "New Concern 增殖型";
    subtitle = "response 没 close issue，discussion 多了一个 thread。";
    caption = "我在 AIII 抽到了 New Concern 增殖型：rebuttal 后 review 区开始二次生长。";
  } else if (names.includes("消失")) {
    title = "No Further Comment 型";
    subtitle = "你交了 response，对面进入静默模式。";
    caption = "我在 AIII 抽到了 No Further Comment 型：discussion 区安静得像还没开分。";
  } else if (decision.name === "Reject") {
    title = "Positive Words, Negative Outcome";
    subtitle = "review 写了 merits，decision 只认 bar。";
    caption = "我在 AIII 抽到了 Positive Words, Negative Outcome：review 里有好话，结果里没有。";
  }

  return {
    title,
    subtitle,
    caption,
    scores: scores.join(" / "),
  };
}

function formatPresentation(decision) {
  return decision.presentation || "Not assigned";
}

function formatDecisionLine(decision) {
  const presentation = formatPresentation(decision);
  return decision.presentation ? `${decision.name} / ${presentation}` : decision.name;
}

function getReviewerPool(decisionName) {
  if (decisionName === "Accept") {
    return reviewerTypes.filter((reviewer) => reviewer.bias >= -1);
  }
  if (decisionName === "Phase 1 Reject" || decisionName === "Reject") {
    return reviewerTypes.filter((reviewer) => reviewer.bias <= 0);
  }
  return reviewerTypes;
}

function renderResult() {
  const { decision, scores, reviewers, meta, persona } = state.result;
  const decisionClass = slugifyDecision(decision.name);
  const presentationLabel = formatPresentation(decision);
  app.innerHTML = `
    <section class="result-shell">
      <article class="result-poster result-${decisionClass}" id="share-card">
        <div class="poster-topline">
          <span>AIII Decision Letter</span>
          <b>${formatDecisionLine(decision)}</b>
        </div>

        <section class="poster-hero">
          <span class="decision-badge">${persona.title}</span>
          <h2 class="result-title decision-title">${decision.name}</h2>
          <p class="result-subline">${decision.effect}</p>
        </section>

        <section class="poster-metrics" aria-label="reviewer scores">
          <div>
            <span>Final Decision</span>
            <strong>${decision.name}</strong>
          </div>
          <div>
            <span>Presentation</span>
            <strong>${presentationLabel}</strong>
          </div>
          <div>
            <span>Scores</span>
            <strong>${scores.join(" / ")}</strong>
          </div>
          <div>
            <span>Confidence</span>
            <strong>${reviewers.map((reviewer) => reviewer.confidence).join(" / ")}</strong>
          </div>
        </section>

        <section class="poster-reviewers">
          ${reviewers
            .map(
              (reviewer, index) => `
              <div>
                <span>R${index + 1}</span>
                <strong>${reviewer.name}</strong>
                <em>${reviewer.tag}</em>
              </div>
            `,
            )
            .join("")}
        </section>

        <section class="poster-truth">
          <p>${decision.truth}</p>
        </section>

        <div class="poster-footer">
          <b>AIII · ${brandFullName}</b>
          <span>${brandChineseName}</span>
        </div>
      </article>

      <details class="reviewer-board" aria-label="reviewer details">
        <summary>展开 reviewer 原文</summary>
        <div class="result-grid">
          ${reviewers
            .map(
              (reviewer, index) => `
              <section class="reviewer-card">
                <h3>Reviewer ${index + 1}：${reviewer.name}</h3>
                <span class="tag">${reviewer.tag}</span>
                <div class="rating-line">
                  <span>Rating ${reviewer.rating}</span>
                  <span>Confidence ${reviewer.confidence}</span>
                </div>
                <p>${reviewer.line}</p>
                <p><strong>作者脑内翻译：</strong>${reviewer.truth}</p>
              </section>
            `,
            )
            .join("")}
        </div>
        <section class="meta-box meta-review-box">
          <h3>AC Meta-review</h3>
          <p>${meta}</p>
          <p class="choice-echo">${buildChoiceEcho()}</p>
        </section>
      </details>

      <div class="result-actions">
        <button class="primary-btn" data-action="download">下载结果卡</button>
        <button class="utility-btn" data-action="copy">复制审稿结果</button>
        <button class="utility-btn" data-action="again">再投一次</button>
        <button class="utility-btn" data-action="home">回到首页</button>
      </div>
    </section>
  `;
  app.querySelector('[data-action="download"]').addEventListener("click", downloadShareCard);
  app.querySelector('[data-action="copy"]').addEventListener("click", copyResultText);
  app.querySelector('[data-action="again"]').addEventListener("click", startQuiz);
  app.querySelector('[data-action="home"]').addEventListener("click", renderIntro);
  resetScroll();
}

function copyResultText() {
  const { decision, scores, reviewers, meta, persona } = state.result;
  const presentationLabel = formatPresentation(decision);
  const text = [
    `AIII：${brandFullName}`,
    `${brandChineseName}`,
    "",
    persona.caption,
    "",
    `Final Decision：${decision.name}`,
    `Presentation：${presentationLabel}`,
    `Review route：${decision.route}`,
    `Reviewer scores：${scores.join(" / ")}`,
    `Confidence：${reviewers.map((reviewer) => reviewer.confidence).join(" / ")}`,
    `我的 AIII 类型：${persona.title}`,
    "",
    ...reviewers.map((reviewer, index) => `Reviewer ${index + 1}：${reviewer.name}`),
    `AC Meta-review：${meta}`,
    `Decision note：${decision.effect}`,
    `作者脑内翻译：${decision.truth}`,
  ].join("\n");

  navigator.clipboard
    .writeText(text)
    .then(() => showToast("结果已复制"))
    .catch(() => showToast("复制失败，可直接选择页面文字"));
}

function buildChoiceEcho() {
  const reviewFirstLook = state.answers.find((answer) => answer.stage === "reviews")?.choice;
  const finalMinute = state.answers.find((answer) => answer.stage === "decision")?.choice;
  if (!reviewFirstLook && !finalMinute) {
    return "这轮结果由 reviewer、AC 和 acceptance bar 的临场状态共同生成。";
  }
  return `你开分时先看「${reviewFirstLook || "review"}」，开奖前还在「${
    finalMinute || "刷新网页"
  }」，decision letter 最后长成了这张卡。`;
}

function downloadShareCard() {
  const { decision, scores, reviewers, persona } = state.result;
  const presentationLabel = formatPresentation(decision);
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  const isAccepted = decision.name === "Accept";
  const heroColor = isAccepted ? "#cfe9df" : "#f6c5b8";
  ctx.fillStyle = "#f4efe5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(20, 20, 20, 0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#fffdf7";
  roundRect(ctx, 70, 70, 940, 1300, 18);
  ctx.fill();
  ctx.strokeStyle = "#141414";
  ctx.lineWidth = 5;
  roundRect(ctx, 70, 70, 940, 1300, 18);
  ctx.stroke();

  ctx.fillStyle = heroColor;
  roundRect(ctx, 100, 118, 880, 372, 14);
  ctx.fill();
  ctx.strokeStyle = "#141414";
  ctx.lineWidth = 4;
  roundRect(ctx, 100, 118, 880, 372, 14);
  ctx.stroke();

  drawText(ctx, "AIII Decision Letter", 130, 175, 28, 820, "#141414");
  drawText(ctx, brandFullName, 130, 212, 22, 820, "#6b342e");
  drawText(ctx, persona.title, 130, 258, 34, 820, "#b93625", 1.05);
  drawText(ctx, decision.name.toUpperCase(), 130, 380, 104, 820, "#141414", 0.88);
  drawText(ctx, decision.effect, 130, 445, 30, 820, "#34312b", 1.25);

  drawPill(ctx, persona.title, 120, 530, 840, "#ef4f2f", "#fffdf7");
  drawText(ctx, `Presentation ${presentationLabel}`, 120, 612, 28, 840, "#141414");
  drawText(ctx, `Final Decision ${decision.name}`, 120, 654, 26, 840, "#66645f");
  drawText(ctx, `Scores ${scores.join(" / ")}`, 520, 565, 34, 430, "#141414");
  drawText(
    ctx,
    `Confidence ${reviewers.map((reviewer) => reviewer.confidence).join(" / ")}`,
    520,
    620,
    26,
    430,
    "#66645f",
  );

  let y = 690;
  drawText(ctx, "Decision note", 120, y, 30, 860, "#b93625");
  y += 52;
  y = drawWrapped(ctx, decision.effect, 120, y, 840, 42, 1.35, "#141414");
  y += 44;

  drawText(ctx, "本轮 reviewer", 120, y, 30, 860, "#141414");
  y += 50;
  reviewers.forEach((reviewer, index) => {
    drawText(ctx, `R${index + 1}  ${reviewer.name}`, 120, y, 34, 820, "#141414");
    y += 42;
  });
  y += 20;

  drawText(ctx, "作者脑内翻译", 120, y, 30, 860, "#b93625");
  y += 48;
  drawWrapped(ctx, decision.truth, 120, y, 840, 34, 1.42, "#141414");

  drawText(ctx, brandChineseName, 110, 1278, 28, 860, "#66645f");
  drawText(ctx, "先交上去，剩下交给 reviewer。", 110, 1322, 26, 860, "#66645f");
  drawText(ctx, "github.io/AIII", 110, 1360, 24, 860, "#66645f");

  const link = document.createElement("a");
  link.download = `AIII_decision_${formatDecisionLine(decision).replace(/[\\/\s]+/g, "_")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  showToast("结果卡已生成");
}

function drawText(ctx, text, x, y, size, maxWidth, color = "#141414", lineHeight = 1.2) {
  ctx.fillStyle = color;
  ctx.font = `900 ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
  return drawWrapped(ctx, text, x, y, maxWidth, size, lineHeight, color);
}

function drawWrapped(ctx, text, x, y, maxWidth, size, lineHeight = 1.4, color = "#141414") {
  ctx.fillStyle = color;
  ctx.font = `${size >= 34 ? 800 : 700} ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
  const chars = [...text];
  let line = "";
  let currentY = y;
  chars.forEach((char) => {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += size * lineHeight;
    } else {
      line = test;
    }
  });
  if (line) {
    ctx.fillText(line, x, currentY);
  }
  return currentY + size * lineHeight;
}

function drawPill(ctx, text, x, y, width, background, color) {
  ctx.fillStyle = background;
  roundRect(ctx, x, y, width, 48, 6);
  ctx.fill();
  ctx.strokeStyle = "#141414";
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, width, 48, 6);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = '900 24px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText(text, x + 18, y + 32);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function resetScroll() {
  window.scrollTo(0, 0);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

renderIntro();
