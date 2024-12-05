import axios from "axios";
const path = "http://localhost:8080";//Immigrant

//고객 추가 페이지 새로운 아이디 받아오기
export const newIdGenerate = () => { 
  return axios
    .get(path + "/customers/nextId")
    .then((result) => {
      return result.data; // 백엔드에서 Integer를 반환하므로 result.data가 관리번호.
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
};
//고객 추가 페이지 파일 저장 기능
// 파일 업로드 기능
export const createFile = (file) => {
  const formData = new FormData();
  formData.append("file", file); // 백엔드에서 기대하는 'file' 키 사용

  return axios.post(path + "/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const downloadFile = async (id, filename) => {
  try {
    const response = await axios.get(`${path}/files/download`, {
      params: { id, filename }, // 'filename'은 이제 파일명만 포함
      responseType: "blob", // 바이너리 데이터로 응답 받기
    });

    // 파일명 추출
    const disposition = response.headers["content-disposition"];
    let fileName = "downloaded_file";
    if (disposition && disposition.indexOf("filename=") !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) { 
        fileName = matches[1].replace(/['"]/g, "");
      }
    }

    // Blob의 MIME 타입을 설정하여 Blob 생성
    const blob = new Blob([response.data], { type: response.headers["content-type"] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};



//고객 추가 페이지
export const createUser = (data) => {
  return axios.post(path + "/customers", data);
};

//검색 페이지 유저 분류, 검색 기능
export const fetchCustomers = (params) => {
  // params는 { name: '...', number: '...'} 형태
  return axios.get(`${path}/customers/search`, { params })
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching customers:', error);
      throw error;
    });
};

//검색 페이지 삭제 기능
export const deleteCustomer = (id) => {
  return axios.delete(`${path}/customers/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting customer:', error);
      throw error;
    });
};

//유저 상세 페이지 번호로 검색
export const fetchCustomerById = (id) => {
  return axios
    .get(`${path}/customers/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching customer:", error);
      throw error;
    });
};

//납부 전 차수들 데이터
export const fetchPendingPhases = async (userId) => {
  try {
    const response = await axios.get(`${path}/customers/${userId}/pending-phases`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending phases:", error);
    throw error;
  }
};


//납부 후 차수들 데이터
export const fetchCompletedPhases = async (userId) => {
  try {
    const response = await axios.get(`${path}/customers/${userId}/completed-phases`);
    return response.data;
  } catch (error) {
    console.error("Error fetching completed phases:", error);
    throw error;
  }
};


/**
 * 특정 사용자의 특정 차수(Phase) 데이터를 가져옵니다.
 * @param {number} userid - 사용자 ID
 * @param {number} chasu - 차수 번호
 * @returns {Promise<Object>} - Phase 데이터
 */
export const fetchPhaseData = (userid, chasu) => {
  return axios
    .get(`${path}/customers/${userid}/phases`)
    .then((result) => {
      const phases = result.data;
      const phase = phases.find((p) => p.phaseNumber === parseInt(chasu, 10));
      return phase;
    })
    .catch((error) => {
      console.error("Error fetching phase data:", error);
      throw error;
    });
};

/**
 * 특정 Phase를 업데이트합니다.
 * @param {number} phaseId - Phase ID
 * @param {Object} data - 업데이트할 데이터
 * @returns {Promise<Object>} - 업데이트된 Phase 데이터
 */
export const updatePhaseData = (phaseId, data) => {
  return axios
    .put(`${path}/phases/${phaseId}`, data)
    .then((result) => result.data)
    .catch((error) => {
      console.error("Error updating phase data:", error);
      throw error;
    });
};

/**
 * 특정 Phase를 업데이트합니다. (콜백 사용)
 * @param {number} phaseId - Phase ID
 * @param {Object} data - 업데이트할 데이터
 * @param {Function} callback - 업데이트 후 호출할 콜백 함수
 */
export const updatePhaseDataWithCallback = (phaseId, data, callback) => {
  axios
    .put(`${path}/phases/${phaseId}`, data)
    .then(() => {
      callback();
    })
    .catch((error) => {
      console.error("Error updating phase data:", error);
    });
};


/**
 * 특정 사용자의 Loan 데이터를 가져옵니다.
 * @param {number} userid - 사용자 ID
 * @returns {Promise<Object>} - Loan 데이터
 */
export const fetchLoanInit = (userid) => {
  return axios
    .get(`${path}/customers/${userid}/loan`)
    .then((result) => result.data)
    .catch((error) => {
      console.error("Error fetching loan data:", error);
      throw error;
    });
};

/**
 * 특정 사용자의 Loan 데이터를 업데이트합니다.
 * @param {number} userid - 사용자 ID
 * @param {Object} data - 업데이트할 Loan 데이터
 * @param {Function} callback - 업데이트 후 호출할 콜백 함수
 */
export const fetchLoanUpdate = (userid, data, callback) => {
  axios
    .put(`${path}/customers/${userid}/loan`, data)
    .then(() => {
      callback();
    })
    .catch((error) => {
      console.error("Error updating loan data:", error);
    });
};



// JWT 토큰을 포함한 요청을 위해 Axios 인터셉터 설정
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // AuthContext에서 관리하는 토큰 사용
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const fetchLogin = (username, password) => { // 매니저 로그인
  return axios.post(path + "/api/auth/signin", {
    username,
    password,
  });
};

export const fetchSignup = (username, email, password, roles) => { // 매니저 회원가입
  return axios.post(path + "/api/auth/signup", {
    username,
    email,
    password,
    roles,
  });
};

export const cancelCustomer = (id) => {
  return axios
    .put(`${path}/customers/${id}/cancel`)
    .then(response => response.data)
    .catch(error => {
      console.error("Error cancelling customer:", error);
      throw error;
    });
};


// 고객 정보 업데이트 기능
export const updateUser = (id, data) => {
  return axios.put(`${path}/customers/${id}`, data)
    .then(response => response.data)
    .catch(error => {
      console.error("Error updating user:", error);
      throw error;
    });
};


// 연체료 조회 페이지: 연체료 정보 가져오기
export const fetchLateFees = (name, number, token) => {
  return axios
    .get(`${path}/latefees`, {
      params: {
        name: name.length > 1 ? name : undefined,
        number: number.length > 1 ? number : undefined,
      },
    })
    .then((result) => result.data)
    .catch((error) => {
      console.error("Error fetching late fees:", error);
      throw error;
    });
};




//=====================================================================================





export const searchFinchasu = (userid) => { // Customer의 이미 납부된 Phase 불러오기
  return axios
    .get(path + "/api/chasuinit/fin/" + userid)
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
};



export const fetchNameSearch = (username) => { //이름으로 Customer 찾기
  return axios
    .get(path + "/api/searchname/" + username)
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
};


export const fetchNumberSearch = (usernumber) => { //회원번호로 Customer 찾기
  return axios
    .get(`${path}/api/searchnumber/${usernumber}`)
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
};


export const deleteUser = (id) => { //Customer 삭제
  return axios
    .post(path + "/api/deleteuser", { id: id.toString() })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error("Error deleting user:", error);
      throw error;
    });
};


