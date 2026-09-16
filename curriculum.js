const parse = (list) => list.map((item) => { const [code, course, credits] = item.split('|'); return { code, course, credits }; });
const sharedFirst = parse(['PH111|Classical Physics|4','MT111|Calculus and Ordinary Differential Equations|4','EC111|Basic Electronics|4','EC111L|Basic Electronics Lab|1.5','CS111|Programming for Problem Solving|4.5','HS111|Technical Communication in English|3','HS112|Indian Knowledge System|1']);
const finalSemester = parse(['LN421|Industrial SLI Project|12','LN422|Thesis Project|12','—|Four elective courses|12','LN423|Project + two elective courses|12','LN424|Internship + two elective courses|12']);
const curricula = {
  CSE: { name: 'Computer Science & Engineering', semesters: [
    { courses: sharedFirst, total: '22 credits', note: 'Includes a three-week mandatory induction program.' },
    { courses: parse(['HS121|Human Values and Ethics|3','ME121|Environmental Science|1','MT121|Linear Algebra and Complex Analysis|4','CS121|Data Structures and Algorithms|4.5','PH121L|UG Physics Laboratory|1.5','CS122|Introduction to Scripting Languages|1','CS123|Digital Systems|4','CS124|Discrete Mathematics|3']), total: '22 credits' },
    { courses: parse(['MT211|Probability and Statistics|4','EC211|Signals and Systems|3','CS211|Computer Organization and Architecture|4','CS213|Database Management Systems|4','CS214|Object Oriented Programming|4','CS215|Design and Analysis of Algorithms|4']), total: '23 credits' },
    { courses: parse(['HS221|Constitutional Studies|1','HS222|Principles of Management|3','CS221|Web Programming|1','CS222|Theory of Computation|3','CS223|Operating Systems|4','CS224|Computer Networks|4','CS225|Data Science|3','—|Program Elective 1|3']), total: '22 credits' },
    { courses: parse(['LN311/LN312|Summer Internship/Project|4','HS311|Psychology, Technology & Society|3','CS311|Software Engineering|3','CS312|Artificial Intelligence|4','CS313|Computer System Security|4','CS314|Software Development Lab|1','—|Program Elective 2|3']), total: '22 credits' },
    { courses: parse(['LN321|B.Tech. Project (BTP)|4','HS321|Introduction to Economics|3','LN322|Seminar and Presentation Skills|1','MT321|Numerical Analysis and Scientific Computing|4','—|Program Elective 3|3','—|Program Elective 4|3','—|Open Elective 1|3']), total: '21 credits' },
    { courses: parse(['LN411|B.Tech. Project (BTP)|4','—|Program Elective 5|3','—|Program Elective 6|3','—|Open Elective 2|3','—|Open Elective 3|3']), total: '16 credits' },
    { courses: finalSemester, total: '12 credits', note: 'Choose one of the listed completion options.' }
  ] },
  CCE: { name: 'Communication & Computer Engineering', semesters: [
    { courses: sharedFirst, total: '22 credits', note: 'Includes a three-week mandatory induction program.' },
    { courses: parse(['HS121|Human Values and Ethics|3','ME121|Environmental Science|1','MT121|Linear Algebra and Complex Analysis|4','CS121|Data Structures and Algorithms|4.5','PH121L|UG Physics Laboratory|1.5','CS122|Introduction to Scripting Languages|1','CS123|Digital Systems|4','CS124|Discrete Mathematics|3']), total: '22 credits' },
    { courses: parse(['MT211|Probability and Statistics|4','CS215|Design and Analysis of Algorithms|4','EC212|Signals and Systems|4','CS212|Computer Organization and Architecture|3','CS213|Database Management Systems|4','CS214|Object Oriented Programming|4']), total: '23 credits' },
    { courses: parse(['HS221|Constitutional Studies|1','CS221|Web Programming|1','CS223|Operating Systems|4','CC221|Computer Communication Networks|4','EC221|Analog and Digital Communication|3','EC221L|Analog and Digital Communication Lab|1.5','CC222|Embedded Systems and IoT|4.5','—|Program Elective 1|3']), total: '22 credits' },
    { courses: parse(['LN311/LN312|Summer Internship/Project|4','HS311|Psychology, Technology & Society|3','EC311|Wireless Communication|3','EC311L|Wireless Communication Lab|1.5','CS311|Software Engineering|3','EC313|Digital Signal Processing|3','EC313L|Digital Signal Processing Lab|1.5','CS314|Software Development Lab|1','—|Program Elective 2|3']), total: '23 credits' },
    { courses: parse(['LN321|B.Tech. Project (BTP)|4','HS321|Introduction to Economics|3','LN322|Seminar and Presentation Skills|1','EC|Information Theory and Coding|3','EC|Control System Engineering|3','CC321|Introduction to AI and ML|4','—|Program Elective 3|3']), total: '21 credits' },
    { courses: parse(['LN411|B.Tech. Project (BTP)|4','—|Program Elective 4|3','—|Program Elective 5|3','—|Open Elective 1|3','—|Open Elective 2|3']), total: '16 credits' },
    { courses: finalSemester, total: '12 credits', note: 'Choose one of the listed completion options.' }
  ] },
  ECE: { name: 'Electronics & Communication Engineering', semesters: [
    { courses: sharedFirst, total: '22 credits', note: 'Includes a three-week mandatory induction program.' },
    { courses: parse(['HS121|Human Values and Ethics|3','ME121|Environmental Science|1','MT121|Linear Algebra and Complex Analysis|4','CS121|Data Structures and Algorithms|4.5','PH121L|UG Physics Laboratory|1.5','CS122|Introduction to Scripting Languages|1','EC121|Semiconductor Devices and Circuits|3','EC122|Analog Electronics|3','EC122L|Analog Electronics Lab|1.5']), total: '22.5 credits' },
    { courses: parse(['MT211|Probability and Statistics|4','EC211|Signals and Systems|3','EC211L|Signals and Systems Lab|1.5','EC213|Digital Circuit and Systems|3','EC213L|Digital Circuit and Systems Lab|1.5','EC214|Engineering Electromagnetics|3','EC215|Microprocessor and Microcontroller|3','EC215L|Microprocessor and Microcontroller Lab|1.5','EC216|Network Analysis and Synthesis|3']), total: '23.5 credits' },
    { courses: parse(['HS221|Constitutional Studies|1','EC221|Analog and Digital Communication|3','EC221L|Analog and Digital Communication Lab|1.5','EC222|Fundamentals of VLSI|3','EC222L|VLSI Lab|1.5','EC223|Microwave Engineering|3','EC223L|Microwave Engineering Lab|1.5','EC224L|Design and Project Lab|1.5','CC321|Introduction to AI and ML|4']), total: '20 credits' },
    { courses: parse(['LN311/LN312|Summer Internship/Project|4','HS311|Psychology, Technology & Society|3','EC311|Wireless Communication|3','EC311L|Wireless Communication Lab|1.5','EC312|Control System Engineering|4','EC313|Digital Signal Processing|3','EC313L|Digital Signal Processing Lab|1.5','—|Program Elective 1|3']), total: '23 credits' },
    { courses: parse(['LN321|B.Tech. Project (BTP)|4','HS321|Introduction to Economics|3','LN322|Seminar and Presentation Skills|1','EC321|5G Wireless Systems and Beyond|3','CC221|Computer Communication Networks|4','—|Program Elective 2|3','—|Program Elective 3|3','—|Open Elective 1|3']), total: '24 credits' },
    { courses: parse(['LN411|B.Tech. Project (BTP)|4','—|Program Elective 4|3','—|Program Elective 5|3','—|Open Elective 2|3','—|Open Elective 3|3']), total: '16 credits' },
    { courses: finalSemester, total: '12 credits', note: 'Choose one of the listed completion options.' }
  ] },
  ME: { name: 'Mechanical Engineering', semesters: [
    { courses: sharedFirst, total: '22 credits', note: 'Includes a three-week mandatory induction program.' },
    { courses: parse(['HS121|Human Values and Ethics|3','ME121|Environmental Science|1','MT121|Linear Algebra and Complex Analysis|4','CS121|Data Structures and Algorithms|4.5','PH121L|UG Physics Lab|1.5','CS122|Introduction to Scripting Languages|1','ME122|Introduction to Mechanical Engineering|1','ME123|Engineering Drawing and Graphics|1.5','ME124|Workshop Practices|1.5','ME125|Engineering Physical Metallurgy|3']), total: '22 credits' },
    { courses: parse(['MT211|Probability and Statistics|4','ME211|Mechanics of Solids|4','ME212|Rigid Body Dynamics|2','ME213|Engineering Thermodynamics|4','ME214|Welding and Casting|4','ME215|Electrical Technology|3']), total: '21 credits' },
    { courses: parse(['HS221|Constitutional Studies|1','ME221|Design of Machine Elements|3','ME222|Fluid Mechanics and Machinery|5','ME223|Machining and Metal Forming|4','ME224|Mechanisms and Machines|3','ME225|Introduction to Computational Methods|1','ME226|Industrial Measurements|4']), total: '21 credits' },
    { courses: parse(['LN311/LN312|Summer Internship/Project|4','ME311|Heat Transfer|4','ME312|Design of Transmission Elements|4','ME313|Digital Manufacturing|4','ME314|Robotics and Control|3','ME315|Mechatronics & IoT|3']), total: '22 credits' },
    { courses: parse(['LN321|B.Tech. Project (BTP)|4','HS321|Introduction to Economics|3','LN322|Seminar and Presentation Skills|1','ME321|IC Engines|4','ME322|Finite Element Methods|3','ME323|Industrial Engineering and Management|3','—|Program Elective 1|3']), total: '21 credits' },
    { courses: parse(['LN411|B.Tech. Project (BTP)|4','—|Open Elective 1|3','—|Program Elective 2|3','—|Program Elective 3|3','—|Program Elective 4|3','—|Open Elective 2|3']), total: '19 credits' },
    { courses: finalSemester, total: '12 credits', note: 'Choose one of the listed completion options.' }
  ] }
};

let branch = 'CSE'; let semester = 0;
const branchTabs = document.querySelector('#branchTabs'); const semesterTabs = document.querySelector('#semesterTabs');
const rows = document.querySelector('#courseRows'); const courseBranch = document.querySelector('#courseBranch'); const courseSemester = document.querySelector('#courseSemester'); const courseCredits = document.querySelector('#courseCredits'); const courseNote = document.querySelector('#courseNote');
function render() {
  const selected = curricula[branch]; const current = selected.semesters[semester];
  branchTabs.innerHTML = Object.keys(curricula).map((key) => `<button class="filter-tab ${key === branch ? 'is-active' : ''}" role="tab" aria-selected="${key === branch}" data-branch="${key}">${key}</button>`).join('');
  semesterTabs.innerHTML = selected.semesters.map((_, index) => `<button class="semester-tab ${index === semester ? 'is-active' : ''}" aria-pressed="${index === semester}" data-semester="${index}">Sem ${index + 1}</button>`).join('');
  courseBranch.textContent = `${branch} · B.TECH`; courseSemester.textContent = `Semester ${semester + 1}`; courseCredits.textContent = current.total;
  rows.innerHTML = current.courses.map(({ code, course, credits }) => `<tr><td>${code}</td><td>${course}</td><td>${credits}</td></tr>`).join('');
  courseNote.textContent = current.note || '';
}
branchTabs.addEventListener('click', (event) => { const key = event.target.dataset.branch; if (key) { branch = key; semester = 0; render(); } });
semesterTabs.addEventListener('click', (event) => { const value = event.target.dataset.semester; if (value !== undefined) { semester = Number(value); render(); } });
render();
