import quizData from './quizdata';

const apiStatus = document.querySelector('#api-status');

if (import.meta.env.DEV) {
  import('../api/browser')
    .then(({ worker }) => worker.start())
    .then(() => fetch('/'))
    .then((res) => res.json())
    .then((res) => (apiStatus.innerText = res.message));
}

const topicButtons = document.querySelectorAll(".topic-button");
const questionContainer = document.querySelector(".question-container");
const previousButton = document.querySelector(".previous-button");
const nextButton = document.querySelector(".next-button");
const submitButton = document.querySelector(".submit-button");

let currentTopic;
let currentQuestionIndex;
let userAnswers = {};

questionContainer.style.display = "none";
previousButton.style.display = "none";
nextButton.style.display = "none";
submitButton.style.display = "none";

topicButtons.forEach(button => {
  button.addEventListener("click", () => {
    const topic = button.getAttribute("data-topic");
    startQuiz(topic);
  });
});

previousButton.addEventListener("click", showPreviousQuestion);

nextButton.addEventListener("click", showNextQuestion);

submitButton.addEventListener("click", showResult);

function startQuiz(topic) {
  currentTopic = topic;
  currentQuestionIndex = 0;
  userAnswers = {};

  showQuestion();
  updateButtonStatus();
  questionContainer.style.display = "block";
  previousButton.style.display = "inline-block";
  nextButton.style.display = "inline-block";
  submitButton.style.display = "inline-block";
}

function showQuestion() {
  const question = quizData[currentTopic][currentQuestionIndex];
  questionContainer.innerHTML = `
    <div class="question">${question.id} ${question.question}</div>
    <div class="options">
      ${question.options
        .map(
          option => `
            <label class="option">
              <input
                type="radio"
                name="answer"
                value="${option}"
                ${userAnswers[currentQuestionIndex] === option ? "checked" : ""}
              />
              ${option}
            </label>
          `
        )
        .join("")}
    </div>
  `;
}

function showPreviousQuestion() {
  currentQuestionIndex--;
  showQuestion();
  updateButtonStatus();
}

function showNextQuestion() {
  if (currentQuestionIndex < quizData[currentTopic].length - 1) {
    currentQuestionIndex++;
    showQuestion();
    updateButtonStatus();
  }
}

function updateButtonStatus() {
  previousButton.disabled = currentQuestionIndex === 0;
  nextButton.disabled = currentQuestionIndex === quizData[currentTopic].length - 1;
}

function saveQuizData() {
  const data = {
    currentTopic,
    currentQuestionIndex,
    userAnswers
  };
  localStorage.setItem("quizData", JSON.stringify(data));
}

questionContainer.addEventListener("change", event => {
  if (event.target.type === "radio") {
    const selectedAnswer = event.target.value;
    userAnswers[currentQuestionIndex] = selectedAnswer;
    saveQuizData();
  }
});

// Show the result with correct and wrong answers
function showResult() {
  // Hide the question container and buttons
  questionContainer.style.display = "none";
  previousButton.style.display = "none";
  nextButton.style.display = "none";
  submitButton.style.display = "none";

  // Calculate the result
  const totalQuestions = quizData[currentTopic].length;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let report = '';

  // Loop through the user answers and compare with the correct answers
  for (let i = 0; i < totalQuestions; i++) {
    const question = quizData[currentTopic][i];
    const userAnswer = userAnswers[i];
    const correctAnswer = question.answer;

    if (userAnswer === correctAnswer) {
      correctAnswers++;
      report += `<p>${question.id} - Correct</p>`;
    } else {
      wrongAnswers++;
      report += `<p>${question.id} - Wrong</p>`;
    }
  }

  // Show the result and report
  const resultContainer = document.createElement('div');
  resultContainer.classList.add('result-container');
  resultContainer.innerHTML = `
    <h3>Result</h3>
    <p>Correct Answers: ${correctAnswers}</p>
    <p>Wrong Answers: ${wrongAnswers}</p>
    <h3>Report</h3>
    ${report}
  `;

  document.getElementById('main').appendChild(resultContainer);
}

// Load the quiz if data is available
if (currentTopic && currentQuestionIndex !== undefined) {
  showQuestion();
  updateButtonStatus();
  questionContainer.style.display = "block";
  previousButton.style.display = "inline-block";
  nextButton.style.display = "inline-block";
  submitButton.style.display = "inline-block";
} else {
  // Clear quiz data if not available
  clearQuizData();
}
