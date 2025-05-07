import browser from "webextension-polyfill";

let jeeExamDate = new Date(2026, 0, 29); // 29 - 01 - 2026
let neetExamDate = new Date(2026, 4, 4); // 04 - 05 - 2026
let jeeAdvExamDate = new Date(2026, 4, 18); // 18 - 05 - 2025

let customExamName = "Custom Exam";
let customExamDate = null;

function parseDateString(dateStr) {
    if (!dateStr) return null;

    const [day, month, year] = dateStr.split("-").map((num) => parseInt(num, 10));
    return new Date(year, month - 1, day);
}

async function fetchExamDates() {
    try {
        const response = await fetch("https://cdn.jsdelivr.net/gh/NovatraX/exam-countdown-extension@main/assets/exam-info.json");
        if (!response.ok) {
            throw new Error(`Failed to fetch exam dates: ${response.status}`);
        }

        const exams = await response.json();

        exams.forEach(exam => {
            const examName = exam.name;
            const examDate = parseDateString(exam.date);

            if (examName == "jeeAdv") {
                jeeAdvExamDate = examDate;
            } else if (examName.includes("neet")) {
                neetExamDate = examDate;
            } else if (examName == "jee") {
                jeeExamDate = examDate;
            }
        });

        console.log("Exam Date Updated From Remote Source");
        return true;
    } catch (error) {
        console.error("Error Fetching Exam Dates", error);
        return false;
    }
}


async function loadCustomExamData() {
    if (!browser.storage) return;

    try {
        const data = await browser.storage.sync.get(["customExamName", "customExamDate"]);
        if (data.customExamName) {
            customExamName = data.customExamName;
        }

        if (data.customExamDate) {
            customExamDate = new Date(data.customExamDate);
        }
    } catch (error) {
        console.error("Error loading custom exam data:", error);
    }
}

function saveCustomExamData(name, date) {
    if (!browser.storage) return false;

    customExamName = name || "Custom Exam";
    customExamDate = date;

    try {
        browser.storage.sync.set({
            customExamName: customExamName,
            customExamDate: customExamDate ? customExamDate.getTime() : null,
        });
        return true;
    } catch (error) {
        console.error("Error saving custom exam data:", error);
        return false;
    }
}

function getCustomExamData() {
    return {
        name: customExamName,
        date: customExamDate,
    };
}

function hasValidCustomExam() {
    return customExamDate && !isNaN(customExamDate.getTime());
}

function getTimeRemaining(endDate, showSeconds = true) {
    const total = endDate - new Date();

    const month = Math.floor(total / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((total % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));

    let result = { total, month, days, hours, minutes };

    if (showSeconds) {
        const seconds = Math.floor((total % (1000 * 60)) / 1000);
        result.seconds = seconds;
    }

    return result;
}

function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

fetchExamDates()
    .then(() => loadCustomExamData())
    .catch((error) => console.error("Error during initialization:", error));

export { jeeExamDate, neetExamDate, jeeAdvExamDate, getTimeRemaining, formatTime, saveCustomExamData, getCustomExamData, hasValidCustomExam, fetchExamDates };
