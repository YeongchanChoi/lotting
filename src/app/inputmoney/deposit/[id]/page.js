"use client";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import styles from "@/styles/DepositAdd.module.scss";
import { InputboxGray } from "@/components/Inputbox";
import Link from "next/link";
import Swal from "sweetalert2";

import {
  fetchDepositHistoriesByCustomerId,
  createDepositHistory,
  fetchPendingPhases,
  fetchCustomerById,
  deleteDepositHistory,
} from "@/utils/api";

// 중첩 필드 업데이트 헬퍼 (예: "loanDetails.loanammount")
const updateNestedField = (state, name, newValue) => {
  const keys = name.split(".");
  if (keys.length === 1) {
    return { ...state, [name]: newValue };
  } else {
    const [parent, child] = keys;
    return {
      ...state,
      [parent]: { ...state[parent], [child]: newValue },
    };
  }
};

// 숫자 입력값에 대해 실시간 포맷팅: 숫자만 남기고 toLocaleString 적용
const handleMoneyChange = (e, setFormData) => {
  const { name, value } = e.target;
  const numeric = value.replace(/\D/g, "");
  const formatted = numeric ? parseInt(numeric, 10).toLocaleString() : "";
  setFormData((prev) => updateNestedField(prev, name, formatted));
};

function DepositAddPage() {
  const { id: userId } = useParams();

  const [isLoanRecord, setIsLoanRecord] = useState(false);
  const [isRecordDeposit, setIsRecordDeposit] = useState(false);
  // 고객의 대출초과액(loanExceedAmount)을 저장 (예: 500000 등)
  const [statusLoanExceed, setStatusLoanExceed] = useState(0);

  const [formData, setFormData] = useState({
    transactionDateTime: "",
    // "적요"는 description로 매핑
    description: "",
    // "비고" (remarks)
    remarks: "",
    details: "",
    contractor: "",
    withdrawnAmount: "",
    depositAmount: "",
    balanceAfter: "",
    branch: "",
    account: "",
    depositPhase1: null,
    customer: { id: userId },
    loanDate: "",
    loanDetails: {
      loanbank: "",
      loanammount: "",
      selfdate: "", // 기존 selfPaymentDate 대신 selfdate 사용
      selfammount: "",
      loanselfsum: "",
      loanselfcurrent: "",
    },
    targetPhases: [],
  });

  const [depositData, setDepositData] = useState([]);
  const [pendingPhases, setPendingPhases] = useState([]);
  const [selectedPhases, setSelectedPhases] = useState([]);
  // expandedDeposits: { [depositId]: boolean }
  const [expandedDeposits, setExpandedDeposits] = useState({});

  useEffect(() => {
    const loadDeposits = async () => {
      try {
        const data = await fetchDepositHistoriesByCustomerId(userId);
        console.log(data);
        setDepositData(data);
      } catch (error) {
        console.error("Error fetching deposits:", error);
        setDepositData([]);
      }
    };
    if (userId) {
      loadDeposits();
    }
  }, [userId]);

  useEffect(() => {
    const loadPendingPhases = async () => {
      try {
        const data = await fetchPendingPhases(userId);
        setPendingPhases(data || []);
      } catch (error) {
        console.error("Error fetching pending phases:", error);
        setPendingPhases([]);
      }
    };
    const loadCustomerData = async () => {
      try {
        const customerData = await fetchCustomerById(userId);
        console.log("Fetched Customer Data:", customerData);
        console.log(customerData.status.loanExceedAmount);
        setFormData((prev) => ({
          ...prev,
          contractor:
            customerData.customerData?.name || customerData.name || "",
        }));
        // 고객 데이터에서 loanExceedAmount 값을 가져와 상태에 저장 (없으면 0)
        setStatusLoanExceed(
          customerData.status?.loanExceedAmount ||
            customerData.loanExceedAmmount ||
            0
        );
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };
    if (userId) {
      loadCustomerData();
      if (isLoanRecord) {
        loadPendingPhases();
      }
    }
  }, [userId, isLoanRecord]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, targetPhases: selectedPhases }));
  }, [selectedPhases]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "loanDate") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // "사용할 대출/자납 합계" = 대출액 + 자납액
  const computedDeposit =
    (Number(formData.loanDetails.loanammount.replace(/,/g, "")) || 0) +
    (Number(formData.loanDetails.selfammount.replace(/,/g, "")) || 0);
  // 대출/자납 잔액 = 고객의 대출초과액 - computedDeposit
  const computedLoanBalance = statusLoanExceed - computedDeposit;

  // 선택된 차수의 총 금액
  const selectedPhasesSum = pendingPhases
    .filter((phase) => selectedPhases.includes(phase.phaseNumber))
    .reduce((acc, phase) => acc + (phase.feesum || 0), 0);

  // 예상 잔액 = (대출/자납 잔액 - 선택된 차수의 금액) 가 음수면 0으로 처리
  const [remainingAmount, setRemainingAmount] = useState(0);
  useEffect(() => {
    setRemainingAmount(Math.max(0, computedLoanBalance - selectedPhasesSum));
  }, [computedLoanBalance, selectedPhasesSum]);

  // 토글 함수: 해당 deposit id에 대해 확장 여부를 토글
  const toggleExpanded = (id) => {
    setExpandedDeposits((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // allocationDetail JSON 문자열을 사람이 읽기 좋은 형식으로 변환하는 헬퍼 함수
  const formatAllocationDetail = (allocationDetail) => {
    if (!allocationDetail) return "";
    try {
      const data = JSON.parse(allocationDetail);
      // 예: { "phase6": { "allocated":1245000, "remainingNeeded":14655000 } }
      return Object.entries(data)
        .map(([key, value]) => {
          const phaseNum = key.replace("phase", "");
          return `${phaseNum}차 납입 : ${Number(value.allocated).toLocaleString()}  ${phaseNum}차 완납까지 : ${Number(value.remainingNeeded).toLocaleString()}`;
        })
        .join("\n");
    } catch (e) {
      return allocationDetail;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.transactionDateTime) {
      Swal.fire({
        icon: "warning",
        title: "필수 입력값 누락",
        text: "거래일시는 필수 입력값입니다.",
      });
      return;
    }

    if (isLoanRecord) {
      // 만약 대출/자납 잔액이 음수라면 제출을 중단
      if (computedLoanBalance < 0) {
        Swal.fire({
          icon: "warning",
          title: "입력 오류",
          text: "대출/자납 잔액이 음수입니다. 확인해주세요.",
        });
        return;
      }
    }
    let submitData = { ...formData };
    const removeCommas = (val) =>
      typeof val === "string" ? val.replace(/,/g, "") : val;
    submitData.withdrawnAmount = removeCommas(submitData.withdrawnAmount);
    submitData.depositAmount = removeCommas(submitData.depositAmount);
    submitData.balanceAfter = removeCommas(submitData.balanceAfter);
    submitData.loanDetails.loanammount = removeCommas(
      submitData.loanDetails.loanammount
    );
    submitData.loanDetails.selfammount = removeCommas(
      submitData.loanDetails.selfammount
    );
    submitData.loanDate = formData.loanDate;
    submitData.loanDetails.selfdate = formData.loanDetails.selfdate; // self납일은 selfdate로 저장
    submitData.targetPhases = selectedPhases;
    if (isLoanRecord) {
      submitData.withdrawnAmount = "0";
      submitData.depositAmount = computedDeposit.toString();
      submitData.loanDetails.loanselfsum = computedDeposit.toString();
      // 대출/자납 잔액을 submitData.loanDetails.loanselfcurrent에 저장
      submitData.loanDetails.loanselfcurrent = computedLoanBalance.toString();
      submitData.loanStatus = "o";
    }
    try {
      await createDepositHistory(submitData);
      console.log("submitData:", submitData);
      Swal.fire({
        icon: "success",
        title: "저장 완료",
        text: "데이터가 성공적으로 저장되었습니다.",
      });

      setDepositData(await fetchDepositHistoriesByCustomerId(userId));
    } catch (error) {
      console.log("submitData:", submitData);
      console.error("Error creating deposit history:", error);
      Swal.fire({
        icon: "error",
        title: "저장 실패",
        text: "데이터 저장에 실패했습니다.",
      });
    }
  };

  const handleDeleteDeposit = async (depositId) => {
    Swal.fire({
      icon: "warning",
      title: "정말 삭제하시겠습니까?",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDepositHistory(depositId);
          Swal.fire({
            icon: "success",
            title: "삭제되었습니다.",
          });
          const updatedDeposits = await fetchDepositHistoriesByCustomerId(userId);
          setDepositData(updatedDeposits);
        } catch (error) {
          console.error("Error deleting deposit history:", error);
          Swal.fire({
            icon: "error",
            title: "삭제에 실패했습니다.",
          });
        }
      }
    });
  };

  const handlePhaseSelection = (phase) => {
    if (selectedPhases.includes(phase.phaseNumber)) {
      setSelectedPhases(selectedPhases.filter((num) => num !== phase.phaseNumber));
    } else {
      setSelectedPhases([...selectedPhases, phase.phaseNumber]);
    }
  };

  const chunkArray = (arr, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };

  return (
    <div className={styles.container}>
      <p></p>
      <div className={styles.infoContainer}>
        <div className={styles.unitbody}>
          <div className={styles.titlebody}>
            <span className={styles.title}>관리번호</span>
          </div>
          <div className={styles.contentbody}>
            <span>{userId || "."}</span>
          </div>
        </div>
        <div className={styles.unitbody}>
          <div className={styles.titlebody}>
            <span className={styles.title}>성명</span>
          </div>
          <div className={styles.contentbody}>
            <span>{formData.contractor || "."}</span>
          </div>
        </div>
      </div>
      <h3>현재 입금내역</h3>
      <p></p>
      <div className={styles.tableWrapper}>
        <div className={styles.tablecontainer}>
          <div className={styles.unitContainer}>거래일시</div>
          <div className={styles.unitContainer}>적요</div>
          <div className={styles.unitContainer}>기재내용</div>
          <div className={styles.unitContainer}>비고</div>
          <div className={styles.unitContainer}>계약자</div>
          <div className={styles.unitContainer}>찾으신 금액</div>
          <div className={styles.unitContainer}>맡기신 금액</div>
          <div className={styles.unitContainer}>거래 후 잔액</div>
          <div className={styles.unitContainer}>취급점</div>
          <div className={styles.unitContainer}>계좌</div>
          <div className={styles.unitContainer}>삭제</div>
        </div>
        {depositData.map((item, index) => (
          <div key={index}>
            <div className={styles.maincontainer}>
              <div className={styles.rowContainer}>
                <div className={styles.unitContainer}>
                  {item.transactionDateTime || "."}
                </div>
                <div className={styles.unitContainer}>
                  {item.description || "."}
                </div>
                <div className={styles.unitContainer}>
                  {item.details || "."}
                </div>
                <div className={styles.unitContainer}>
                  {item.remarks || "."}
                </div>
                <div className={styles.unitContainer}>
                  {item.contractor || "."}
                </div>
                <div className={styles.unitContainer}>
                  {item.withdrawnAmount
                    ? Number(item.withdrawnAmount).toLocaleString()
                    : "."}
                </div>
                <div className={styles.unitContainer}>
                  {item.depositAmount
                    ? Number(item.depositAmount).toLocaleString()
                    : "."}
                </div>
                <div className={styles.unitContainer}>
                  {item.balanceAfter
                    ? Number(item.balanceAfter).toLocaleString()
                    : "."}
                </div>
                <div className={styles.unitContainer}>
                  {item.branch || "."}
                </div>
                <div className={styles.unitContainer}>
                  {item.account || "."}
                </div>
              </div>
              <div className={styles.unitContainer}>
                {item.loanStatus === "o" ? (
                  <button
                    className={styles.TableButton2}
                    onClick={() => toggleExpanded(item.id)}
                  >
                    {expandedDeposits[item.id] ? "숨기기" : "상세보기"}
                  </button>
                ) : (
                  <Link href={`/inputmoney/deposit/modify/${item.id}`}>
                    <button className={styles.TableButton}>수정하기</button>
                  </Link>
                )}
                <button
                  className={styles.TableButton}
                  onClick={() => handleDeleteDeposit(item.id)}
                >
                  삭제하기
                </button>
              </div>
            </div>
            {item.loanStatus === "o" && expandedDeposits[item.id] && item.allocationDetail && (
              <div className={styles.allocationDetail}>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {formatAllocationDetail(item.allocationDetail)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
      <p></p>
      <h3>입금내역 추가</h3>
      <p></p>
      <form onSubmit={handleSubmit}>
        {/* 상단 입력란: 거래일시, 적요, 기재내용, 비고 */}
        <div className={styles.infoContainer}>
          <div className={styles.unitbody}>
            <div className={styles.titlebody}>
              <label className={styles.title}>거래일시</label>
            </div>
            <div className={styles.contentbody}>
              <InputboxGray
                type="datetime-local"
                name="transactionDateTime"
                value={formData.transactionDateTime}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className={styles.unitbody}>
            <div className={styles.titlebody}>
              <label className={styles.title}>적요</label>
            </div>
            <div className={styles.contentbody}>
              <InputboxGray
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className={styles.unitbody}>
            <div className={styles.titlebody}>
              <label className={styles.title}>기재내용</label>
            </div>
            <div className={styles.contentbody}>
              <InputboxGray
                type="text"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {/* 추가: 비고 */}
          <div className={styles.unitbody}>
            <div className={styles.titlebody}>
              <label className={styles.title}>비고</label>
            </div>
            <div className={styles.contentbody}>
              <InputboxGray
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        {/* 중단 입력란: 계약자, depositPhase1, 찾으신 금액, 맡기신 금액 */}
        <div className={styles.infoContainer}>
          <div className={styles.unitbody}>
            <div className={styles.titlebody}>
              <label className={styles.title}>계약자</label>
            </div>
            <div className={styles.contentbody}>
              <InputboxGray
                type="text"
                name="contractor"
                value={formData.contractor}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {!isLoanRecord && (
            <>
              <div className={styles.unitbody}>
                <div className={styles.titlebody}>
                  <label className={styles.title}>찾으신 금액</label>
                </div>
                <div className={styles.contentbody}>
                  <InputboxGray
                    type="text"
                    name="withdrawnAmount"
                    value={formData.withdrawnAmount}
                    onChange={(e) => handleMoneyChange(e, setFormData)}
                    onFocus={(e) => handleMoneyChange(e, setFormData)}
                  />
                </div>
              </div>
              <div className={styles.unitbody}>
                <div className={styles.titlebody}>
                  <label className={styles.title}>맡기신 금액</label>
                </div>
                <div className={styles.contentbody}>
                  <InputboxGray
                    type="text"
                    name="depositAmount"
                    value={formData.depositAmount}
                    onChange={(e) => handleMoneyChange(e, setFormData)}
                    onFocus={(e) => handleMoneyChange(e, setFormData)}
                  />
                </div>
              </div>
            </>
          )}
          {isLoanRecord && (
            <div className={styles.unitbody}>
              <div className={styles.titlebody}>
                <label className={styles.title}>
                  {isLoanRecord ? "대출액+자납액" : "맡기신 금액"}
                </label>
              </div>
              <div className={styles.contentbody}>
                {isLoanRecord ? (
                  <InputboxGray
                    type="text"
                    name="depositAmount"
                    value={computedDeposit.toLocaleString()}
                    disabled
                  />
                ) : (
                  <InputboxGray
                    type="text"
                    name="depositAmount"
                    value={formData.depositAmount}
                    onChange={(e) => handleMoneyChange(e, setFormData)}
                    onFocus={(e) => handleMoneyChange(e, setFormData)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        {/* 하단 입력란: 거래 후 잔액, 취급점, 계좌 */}
        <div className={styles.infoContainer}>
          <div className={styles.unitbody}>
            <div className={styles.titlebody}>
              <label className={styles.title}>거래 후 잔액</label>
            </div>
            <div className={styles.contentbody}>
              <InputboxGray
                type="text"
                name="balanceAfter"
                value={formData.balanceAfter}
                onChange={(e) => handleMoneyChange(e, setFormData)}
                onFocus={(e) => handleMoneyChange(e, setFormData)}
              />
            </div>
          </div>
          <div className={styles.unitbody}>
            <div className={styles.titlebody}>
              <label className={styles.title}>취급점</label>
            </div>
            <div className={styles.contentbody}>
              <InputboxGray
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className={styles.unitbody}>
            <div className={styles.titlebody}>
              <label className={styles.title}>계좌</label>
            </div>
            <div className={styles.contentbody}>
              <InputboxGray
                type="text"
                name="account"
                value={formData.account}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.unitbody}>
            <label className={styles.title}>
              <input
                type="checkbox"
                checked={isLoanRecord}
                onChange={(e) => setIsLoanRecord(e.target.checked)}
              />
              대출/자납 기록인가요?
            </label>
          </div>
          <div className={styles.unitbody}>
            <label className={styles.title}>
              <input
                type="checkbox"
                checked={isRecordDeposit}
                onChange={(e) => {
                  setIsRecordDeposit(e.target.checked);
                  if (!e.target.checked) {
                    setFormData((prev) => ({ ...prev, depositPhase1: null }));
                  }
                }}
              />
              기록용 (1차 'x' 등)
            </label>
          </div>
        </div>
        {isRecordDeposit && (
          <div className={styles.infoContainer}>
            <div className={styles.unitbody}>
              <div className={styles.titlebody}>
                <label className={styles.title}>기록용 depositPhase1</label>
              </div>
              <div className={styles.contentbody}>
                <InputboxGray
                  type="text"
                  name="depositPhase1"
                  value={formData.depositPhase1 || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}
        {isLoanRecord && (
          <>
            <p></p>
            <h3>사용할 대출정보 입력</h3>
            <div className={styles.infoContainer}>
              <div className={styles.unitbody}>
                <div className={styles.titlebody}>
                  <label className={styles.title}>대출액</label>
                </div>
                <div className={styles.contentbody}>
                  <InputboxGray
                    type="text"
                    name="loanDetails.loanammount"
                    value={formData.loanDetails.loanammount}
                    onChange={(e) => handleMoneyChange(e, setFormData)}
                    onFocus={(e) => handleMoneyChange(e, setFormData)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.infoContainer}>
              <div className={styles.unitbody}>
                <div className={styles.titlebody}>
                  <label className={styles.title}>자납액</label>
                </div>
                <div className={styles.contentbody}>
                  <InputboxGray
                    type="text"
                    name="loanDetails.selfammount"
                    value={formData.loanDetails.selfammount}
                    onChange={(e) => handleMoneyChange(e, setFormData)}
                    onFocus={(e) => handleMoneyChange(e, setFormData)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.infoContainer}>
              <div className={styles.row}>
                <div className={styles.unitbody}>
                  <div className={styles.titlebody}>
                    <label className={styles.title}>사용할 대출/자납 합계</label>
                  </div>
                  <div className={styles.contentbody}>
                    <InputboxGray
                      type="text"
                      name="loanDetails.loanselfsum"
                      value={computedDeposit.toLocaleString()}
                      disabled
                    />
                  </div>
                </div>
                <div className={styles.unitbody}>
                  <div className={styles.titlebody}>
                    <label className={styles.title}>대출/자납 잔액</label>
                  </div>
                  <div className={styles.contentbody}>
                    <InputboxGray
                      type="text"
                      name="loanDetails.loanselfcurrent"
                      value={computedLoanBalance.toLocaleString()}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
            <h4>📌 진행 예정 납부 차수 선택 (복수 선택 가능)</h4>
            <div className={styles.infoContainer}>
              <div className={styles.unitbody}>
                <div className={styles.titlebody}>
                  <span className={styles.title}>예상 잔액</span>
                </div>
                <div className={styles.contentbody}>
                  <p>
                    💰 <strong>{remainingAmount.toLocaleString()}₩</strong>
                  </p>
                </div>
              </div>
            </div>
            {pendingPhases.length > 0 ? (
              <ul>
                {pendingPhases.map((phase) => {
                  const phaseAmount = phase.feesum ?? 0;
                  const isSelected = selectedPhases.includes(phase.phaseNumber);
                  const isDisabled = isLoanRecord
                    ? false
                    : remainingAmount < phaseAmount && !isSelected;
                  return (
                    <li key={phase.phaseNumber}>
                      <div className={styles.infoContainer}>
                        <div className={styles.unitbody}>
                          <div className={styles.titlebody}>
                            <span className={styles.phaseTitle}>
                              {phase.phaseNumber}차 총액(잔액)
                            </span>
                          </div>
                          <div
                            className={`${styles.contentbody2} ${
                              isSelected ? styles.selected : ""
                            } ${isDisabled ? styles.disabledPhase : ""}`}
                            onClick={() =>
                              !isDisabled && handlePhaseSelection(phase)
                            }
                          >
                            <div className={styles.phaseAmount}>
                              {phaseAmount.toLocaleString()}₩{" "}
                              {phase.sum != null && (
                                <span>({Number(phase.sum).toLocaleString()}₩)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>진행 예정 납부 차수가 없습니다.</p>
            )}
          </>
        )}
        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.contractButton}>
            추가하기
          </button>
        </div>
      </form>
    </div>
  );
}

export default DepositAddPage;
