var cl = console.log;

const BASE_URL = `https://gaurav2-1b96d-default-rtdb.firebaseio.com/`
const STUDENT_URL = `${BASE_URL}/StudentfetchGeneric1.json`

const state = {
    studentsArr: [],
    edit_id: null
}

const studentForm = document.getElementById("studentForm")
const studentName = document.getElementById("studentName")
const rollNo = document.getElementById("rollNo")
const course = document.getElementById("course")
const submitBtn = document.getElementById("submitBtn")
const tbody = document.getElementById("tbody")
const updateBtn = document.getElementById("updateBtn")
const formHeading = document.getElementById("formHeading")

//================== Generic ======================
async function makeGenericApiCall(url, method, body) {
    body = body ? JSON.stringify(body) : null

    let res = await fetch(url, {
        body: body,
        method: method,
        headers: {
            "Content-type": "application/json",
            "Autherization": "TOKEN"
        }
    })
    if (!res.ok) {
        throw new Error(`HTTP Error : ${res.status}`)
    }

    let data = await res.json()
    return data
}
//================== Create ======================
async function addingNewStudent(eve) {
    try {
        eve.preventDefault()

        let newStu = {
            studentName: studentName.value,
            rollNo: rollNo.value,
            course: course.value,
        }

        showSpinner("text-success")
        let data = await makeGenericApiCall(STUDENT_URL, "POST", newStu)
        newStu.id = data.name
        state.studentsArr.unshift(newStu)
        let tr = document.createElement("tr")
        tr.id = data.name
        tr.innerHTML = `<td>1</td>
                    <td>${newStu.studentName}</td>
                    <td>${newStu.rollNo}</td>
                    <td>${newStu.course}</td>
                    <td><button onClick="editStudent(this)" class="btn btn-warning">Edit</button>
                    <button onClick="deleteStudent(this)" class="btn btn-danger ml-1">Delete</button></td>`

        tbody.prepend(tr)
        let td = [...document.querySelectorAll("#tbody tr")]
        td.forEach((tr, i) => {
            tr.querySelector("td").innerText = i + 1
        })

        studentForm.reset()
        hideSpinner("text-success")
        showSnackBar("Added!", "Post added successfully", "success")

    } catch (err) {
        hideSpinner("text-success")
        showSnackBar("Error", err, "error")
    }
}
//================== Read ======================
async function fetchStudents(arr) {
    try {
        showSpinner("text-success")
        let data = await makeGenericApiCall(STUDENT_URL, "GET")
        for (const key in data) {
            data[key].id = key
            state.studentsArr.unshift(data[key])
        }
        let result = ''
        arr.forEach((ele, i) => {
            result += `
                <tr id=${ele.id}>
                    <td>${i + 1}</td>
                    <td>${ele.studentName}</td>
                    <td>${ele.rollNo}</td>
                    <td>${ele.course}</td>
                    <td><button onClick="editStudent(this)" class="btn btn-warning">Edit</button>
                    <button onClick="deleteStudent(this)" class="btn btn-danger ml-1">Delete</button></td>
                </tr>
        `
        });

        tbody.innerHTML = result
        hideSpinner("text-success")
    } catch (err) {
        hideSpinner("text-success")
        showSnackBar("Error", err, "error")
    }

}
fetchStudents(state.studentsArr)
//================== Edit ======================
async function editStudent(ele) {
    try {
        let EDIT_ID = ele.closest("tr").id
        cl(ele.closest("tr"))
        let EDIT_URL = `${BASE_URL}/StudentfetchGeneric1/${EDIT_ID}.json`

        showSpinner("text-success")
        let data = await makeGenericApiCall(EDIT_URL, "GET")

        formHeading.innerHTML = "Update Student"
        studentName.value = data.studentName
        rollNo.value = data.rollNo
        course.value = data.course

        submitBtn.classList.add("d-none")
        updateBtn.classList.remove("d-none")
        state.edit_id = EDIT_ID
        hideSpinner("text-success")

    } catch (err) {
        hideSpinner("text-success")
        showSnackBar("Error", err, "error")
    }
}
//================== Update ======================
async function updateStudentData(ele) {
    try {
        let UPDATE_ID = state.edit_id
        let UPDATE_URL = `${BASE_URL}/StudentfetchGeneric1/${UPDATE_ID}.json`

        let updatedStudent = {
            studentName: studentName.value,
            rollNo: rollNo.value,
            course: course.value,
            id: UPDATE_ID
        }

        showSpinner("text-success")
        let data = await makeGenericApiCall(UPDATE_URL, "PATCH", updatedStudent)
        let getIndex = state.studentsArr.findIndex(ele => ele.id === UPDATE_ID)
        state.studentsArr[getIndex] = updatedStudent

        document.getElementById(UPDATE_ID).innerHTML = `
                    <td>1</td>
                    <td>${updatedStudent.studentName}</td>
                    <td>${updatedStudent.rollNo}</td>
                    <td>${updatedStudent.course}</td>
                    <td><button onClick="editStudent(this)" class="btn btn-warning">Edit</button>
                    <button onClick="deleteStudent(this)" class="btn btn-danger ml-1">Delete</button></td>
                                                    `
        let td = [...document.querySelectorAll("#tbody tr")]
        td.forEach((tr, i) => {
            tr.querySelector("td").innerText = i + 1
        })
        formHeading.innerHTML = "Add New Student"
        submitBtn.classList.remove("d-none")
        updateBtn.classList.add("d-none")
        studentForm.reset()
        hideSpinner("text-success")

        showSnackBar("Updated!", "Post updated successfully", "success")

    } catch (err) {
        hideSpinner("text-success")

        showSnackBar("Error", err, "error")
    }
}
//================== Delete ======================
async function deleteStudent(ele) {
    try {
        let DELETE_ID = ele.closest("tr").id
        let DELETE_URL = `${BASE_URL}/StudentfetchGeneric1/${DELETE_ID}.json`

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {

                showSpinner("text-danger")
                let data = await makeGenericApiCall(DELETE_URL, "DELETE")
                let getIndex = state.studentsArr.findIndex(ele => ele.id === DELETE_ID)

                state.studentsArr.splice(getIndex, 1)
                ele.closest("tr").remove()
                let td = [...document.querySelectorAll("#tbody tr")]
                td.forEach((tr, i) => {
                    tr.querySelector("td").innerText = i + 1
                })
                hideSpinner("text-danger")
                showSnackBar("Removed!", "Post removed successfully", "success")
            }
        });
    } catch (err) {
        hideSpinner("text-danger")
        showSnackBar("Error", err, "error")

    }
}

function showSnackBar(title, msg, icon) {
    Swal.fire({
        title: title,
        text: msg,
        icon: icon
    });
}

function showSpinner(color) {
    spinner.classList.remove("d-none")
    spinner.classList.add(color)
}

function hideSpinner(color) {
    spinner.classList.add("d-none")
    spinner.classList.remove(color)
}

studentForm.addEventListener("submit", addingNewStudent)
updateBtn.addEventListener("click", updateStudentData)


























