"use client";

import styles from "@/styles/Create.module.scss";
import Swal from "sweetalert2";
import {
  Inputbox,
  PostInputbox,
  InputAreabox,
  DropInputbox,
  FileInputbox,
  Checkbox,
  PostInputbox2,
} from "@/components/Inputbox";
import { Button_Y } from "@/components/Button";
import withAuth from "@/utils/hoc/withAuth";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { updateUser, fetchCustomerById, createFile, deleteFile } from "@/utils/api";
import { useRouter } from "next/navigation";

import {
  banklist,
  classificationlist,
  typeidlist,
  typelist,
  grouplist,
  turnlist,
} from "@/components/droplistdata";

function Modify({ params }) {
  const router = useRouter();
  const { id } = params; // URL에서 id 파라미터 추출

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const [isupload, setIsupload] = useState({
    isuploaded: false,
    sealcertificateprovided: false,
    selfsignatureconfirmationprovided: false,
    commitmentletterprovided: false,
    idcopyprovided: false,
    freeoption: false,
    forfounding: false,
    agreement: false,
    preferenceattachment: false,
    prizeattachment: false,
    exemption7: false,
    investmentfile: false,
    contract: false,
  });

  const [file, setFile] = useState(null);
  const [existingFileInfo, setExistingFileInfo] = useState("");

  // 주소 값을 미리 담아두기 위한 state
  const [initialLegalPostNumber, setInitialLegalPostNumber] = useState("");
  const [initialLegalAddress, setInitialLegalAddress] = useState("");
  const [initialPostreceivePostNumber, setInitialPostreceivePostNumber] = useState("");
  const [initialPostreceiveAddress, setInitialPostreceiveAddress] = useState("");

  // 수정 부분: 천 단위 콤마 표시를 위한 로컬 상태
  const [formattedRegisterPrice, setFormattedRegisterPrice] = useState("");
  const [formattedDepositAmmount, setFormattedDepositAmmount] = useState("");

  // 천 단위 콤마 포맷 함수
  const formatNumberWithCommas = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (!numericValue) return "";
    return parseInt(numericValue, 10).toLocaleString();
  };

  // 가입가 변경 핸들러
  const handleRegisterPriceChange = (e) => {
    const formattedValue = formatNumberWithCommas(e.target.value);
    setFormattedRegisterPrice(formattedValue);
    const rawValue = formattedValue.replace(/,/g, "");
    setValue("registerprice", rawValue ? parseInt(rawValue, 10) : null);
  };

  // 예약금 변경 핸들러
  const handleDepositAmmountChange = (e) => {
    const formattedValue = formatNumberWithCommas(e.target.value);
    setFormattedDepositAmmount(formattedValue);
    const rawValue = formattedValue.replace(/,/g, "");
    setValue("Deposit.depositammount", rawValue ? parseInt(rawValue, 10) : null);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const customer = await fetchCustomerById(id);
        if (customer) {
          console.log(customer)
          // 주소값 설정
          setInitialLegalPostNumber(customer.legalAddress.postnumber || "");
          setInitialLegalAddress(customer.legalAddress.post || "");
          setInitialPostreceivePostNumber(customer.postreceive.postnumberreceive || "");
          setInitialPostreceiveAddress(customer.postreceive.postreceive || "");

          // 폼에 기본값 설정
          reset({
            customertype: customer.customertype,
            type: customer.type,
            groupname: customer.groupname,
            turn: customer.turn,
            batch: customer.batch,
            registerdate: customer.registerdate,
            registerprice: customer.registerprice,
            registerpath: customer.registerpath,
            specialnote: customer.specialnote,
            CustomerData: {
              name: customer.customerData.name,
              phone: customer.customerData.phone,
              resnumfront: customer.customerData.resnumfront,
              resnumback: customer.customerData.resnumback,
              email: customer.customerData.email,
            },
            LegalAddress: {
              postnumber: customer.legalAddress.postnumber,
              post: customer.legalAddress.post,
              detailaddress: customer.legalAddress.detailaddress,
            },
            Postreceive: {
              postnumberreceive: customer.postreceive.postnumberreceive,
              postreceive: customer.postreceive.postreceive,
              detailaddressreceive: customer.postreceive.detailaddressreceive,
            },
            Financial: {
              bankname: customer.financial.bankname,
              accountnum: customer.financial.accountnum,
              accountholder: customer.financial.accountholder,
            },
            Deposit: {
              depositdate: customer.deposits.depositdate,
              depositammount: customer.deposits.depositammount,
            },
            Responsible: {
              generalmanagement: customer.responsible.generalmanagement,
              division: customer.responsible.division,
              team: customer.responsible.team,
              managername: customer.responsible.managername,
            },
            MGM: {
              mgmcompanyname: customer.mgm.mgmcompanyname,
              mgmname: customer.mgm.mgmname,
              mgminstitution: customer.mgm.mgminstitution,
              mgmaccount: customer.mgm.mgmaccount,
            },
          });

          // 체크박스 상태 설정
          setIsupload({
            isuploaded: customer.attachments.isuploaded,
            sealcertificateprovided: customer.attachments.sealcertificateprovided,
            selfsignatureconfirmationprovided: customer.attachments.selfsignatureconfirmationprovided,
            commitmentletterprovided: customer.attachments.commitmentletterprovided,
            idcopyprovided: customer.attachments.idcopyprovided,
            freeoption: customer.attachments.freeoption,
            forfounding: customer.attachments.forfounding,
            agreement: customer.attachments.agreement,
            preferenceattachment: customer.attachments.preferenceattachment,
            prizeattachment: customer.attachments.prizeattachment,
            exemption7: customer.attachments.exemption7,
            investmentfile: customer.attachments.investmentfile,
            contract: customer.attachments.contract,
          });

          console.log(isupload)
          setExistingFileInfo(customer.attachments.fileinfo || "");

          // 수정 부분: 초기 데이터 로딩 후 콤마 추가
          if (customer.registerprice) {
            setFormattedRegisterPrice(customer.registerprice.toLocaleString());
          }
          if (customer.deposits.depositammount) {
            setFormattedDepositAmmount(customer.deposits.depositammount.toLocaleString());
          }
        }
      } catch (error) {
        console.error("고객 정보를 가져오는데 실패했습니다:", error);
      }
    };
    getData();
  }, [id, reset]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setIsupload((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setIsupload((prev) => ({
        ...prev,
        isuploaded: true,
      }));
    }
  };

  // onError 핸들러
  const onError = (errors) => {
    console.log("검증 오류:", errors);

    const errorMessages = [];

    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        if (errors[field].message) {
          errorMessages.push(errors[field].message);
        } else if (typeof errors[field] === 'object' && errors[field] !== null) {
          for (const subField in errors[field]) {
            if (errors[field].hasOwnProperty(subField) && errors[field][subField].message) {
              errorMessages.push(errors[field][subField].message);
            }
          }
        }
      }
    }

    const errorMessage = errorMessages.join('\n');

    Swal.fire({
      icon: 'warning',
      title: '필수 항목 누락',
      text: errorMessage,
    });
  };

  // onSubmit 핸들러
  const onSubmit = async (data) => {
    try {
      // 데이터 파싱 및 정리
      const parsedData = {
        ...data,
        CustomerData: {
          ...data.CustomerData,
          resnumfront: parseInt(data.CustomerData.resnumfront),
          resnumback: parseInt(data.CustomerData.resnumback),
        },
        registerprice: parseInt(data.registerprice),
        Deposit: {
          ...data.Deposit,
          depositdate: data.Deposit.depositdate,
          depositammount: parseInt(data.Deposit.depositammount),
        },
      };

      let uploadedFileInfo = existingFileInfo;

      if (file) {
        // 기존 파일이 존재하면 삭제
        if (existingFileInfo) {
          await deleteFile(existingFileInfo);
        }
        // 새로운 파일 업로드
        const uploadResponse = await createFile(file, parseInt(id, 10));
        uploadedFileInfo = uploadResponse.data;
      }

      // Attachments 정보 추가
      const attachments = {
        ...isupload,
        fileinfo: uploadedFileInfo,
      };

      // 최종 고객 데이터 구성
      const customerData = {
        id: parseInt(id),
        customertype: parsedData.customertype,
        registerpath: parsedData.registerpath,
        type: parsedData.type,
        groupname: parsedData.groupname,
        turn: parsedData.turn,
        batch: parsedData.batch,
        registerdate: parsedData.registerdate,
        registerprice: parsedData.registerprice,
        CustomerData: parsedData.CustomerData,
        Financial: parsedData.Financial,
        LegalAddress: {
          ...parsedData.LegalAddress,
        },
        Postreceive: {
          ...parsedData.Postreceive,
        },
        MGM: parsedData.MGM,
        Responsible: parsedData.Responsible,
        deposits: parsedData.Deposit,
        attachments: attachments,
        exemption7: parsedData.exemption7,
        investmentfile: parsedData.investmentfile,
        contract: parsedData.contract,
        agreement: parsedData.agreement,
        preferenceattachment: parsedData.preferenceattachment,
        prizeattachment: parsedData.prizeattachment,
        sealcertificateprovided: parsedData.sealcertificateprovided,
        selfsignatureconfirmationprovided: parsedData.selfsignatureconfirmationprovided,
        commitmentletterprovided: parsedData.commitmentletterprovided,
        idcopyprovided: parsedData.idcopyprovided,
        freeoption: parsedData.freeoption,
        forfounding: parsedData.forfounding,
        specialnote: parsedData.specialnote,
      };

      const updateUserResponse = await updateUser(id, customerData);

      Swal.fire({
        icon: "success",
        title: "회원정보가 수정되었습니다.",
        text:
          "관리번호 : " +
          updateUserResponse.id +
          "/ 회원명 : " +
          parsedData.CustomerData.name,
      });

      reset();
      setFile(null);
      setIsupload({
        isuploaded: false,
        sealcertificateprovided: false,
        selfsignatureconfirmationprovided: false,
        commitmentletterprovided: false,
        idcopyprovided: false,
        freeoption: false,
        forfounding: false,
        agreement: false,
        preferenceattachment: false,
        prizeattachment: false,
        exemption7: false,
        investmentfile: false,
        contract: false,
      });
      setFormattedRegisterPrice("");
      setFormattedDepositAmmount("");
      window.scrollTo(0, 0);
      router.push(`/search/${id}`); // 수정 후 해당 고객 상세 페이지로 이동
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "회원정보 수정 실패",
        text:
          "회원 정보를 수정하는 동안 오류가 발생했습니다. 다시 시도해주세요.",
      });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <h3>회원 정보 수정</h3>
        <div className={styles.content_container}>
          <div className={styles.Font}>관리번호 : {id}</div>
          <h1></h1>
          <div>
            <Inputbox
              type="text"
              placeholder="이름 *"
              register={register("CustomerData.name", { required: "이름을 입력해주세요." })}
              isError={!!errors.CustomerData?.name}
            />
          </div>
          <div>
            <Inputbox
              type="phone"
              placeholder="휴대폰 번호 *"
              register={register("CustomerData.phone", { required: "휴대폰 번호를 입력해주세요." })}
              isError={!!errors.CustomerData?.phone}
            />
          </div>
          <div>
            <Inputbox
              type="number"
              placeholder="주민번호 앞자리 *"
              register={register("CustomerData.resnumfront", { required: "주민번호 앞자리를 입력해주세요." })}
              isError={!!errors.CustomerData?.resnumfront}
            />
          </div>
          <div>
            <Inputbox
              type="number"
              placeholder="주민번호 뒷자리 *"
              register={register("CustomerData.resnumback", { required: "주민번호 뒷자리를 입력해주세요." })}
              isError={!!errors.CustomerData?.resnumback}
            />
          </div>
          <div>
            <Inputbox
              type="email"
              placeholder="이메일 *"
              register={register("CustomerData.email", { required: "이메일을 입력해주세요." })}
              isError={!!errors.CustomerData?.email}
            />
          </div>
          <div>
            <DropInputbox
              list={classificationlist}
              register={register("customertype", { required: "분류를 선택해주세요." })}
              placeholder="분류 *"
              isError={!!errors.customertype}
            />
          </div>
          <div>
            <Inputbox
              type="text"
              placeholder="가입경로 *"
              register={register("registerpath", { required: "가입경로를 입력해주세요." })}
              isError={!!errors.registerpath}
            />
          </div>
          <div>
            <DropInputbox
              list={banklist}
              register={register("Financial.bankname", { required: "은행을 선택해주세요." })}
              placeholder="은행 *"
              isError={!!errors.Financial?.bankname}
            />
          </div>
          <div>
            <Inputbox
              type="text"
              placeholder="계좌번호 *"
              register={register("Financial.accountnum", { required: "계좌번호를 입력해주세요." })}
              isError={!!errors.Financial?.accountnum}
            />
          </div>
          <div>
            <Inputbox
              type="text"
              placeholder="예금주 *"
              register={register("Financial.accountholder", { required: "예금주를 입력해주세요." })}
              isError={!!errors.Financial?.accountholder}
            />
          </div>

          <div className={styles.InputboxField}>
            <div className={styles.InputFont}>법정주소 *</div>
            <PostInputbox2
              register={register}
              setValue={setValue}
              namePrefix="LegalAddress"
              postcodeName="LegalAddress.postnumber"
              addressName="LegalAddress.post"
              initialPostNumber={initialLegalPostNumber}
              initialAddress={initialLegalAddress}
              isError={!!errors.LegalAddress?.postnumber || !!errors.LegalAddress?.post || !!errors.LegalAddress?.detailaddress}
            />
            <Inputbox
              type="text"
              placeholder="법정주소 상세 *"
              register={register("LegalAddress.detailaddress", { required: "법정주소를 입력해주세요." })}
              isError={!!errors.LegalAddress?.detailaddress}
            />
          </div>

          <div className={styles.InputboxField}>
            <div className={styles.InputFont}>우편물 주소지 *</div>
            <PostInputbox2
              register={register}
              setValue={setValue}
              namePrefix="Postreceive"
              postcodeName="Postreceive.postnumberreceive"
              addressName="Postreceive.postreceive"
              initialPostNumber={initialPostreceivePostNumber}
              initialAddress={initialPostreceiveAddress}
              isError={!!errors.Postreceive?.postnumberreceive || !!errors.Postreceive?.postreceive || !!errors.Postreceive?.detailaddressreceive}
            />
            <Inputbox
              type="text"
              placeholder="우편물 주소지 상세 *"
              register={register("Postreceive.detailaddressreceive", { required: "우편물 주소지를 입력해주세요." })}
              isError={!!errors.Postreceive?.detailaddressreceive}
            />
          </div>
        </div>

        <h3>관리 정보</h3>
        <div className={styles.mainbody}>
          <div className={styles.content_body}>
            <div className={styles.content_body2}>
              <DropInputbox
                list={typeidlist}
                register={register("batch", { required: "제출 순번을 선택해주세요." })}
                placeholder="제출 순번 *"
                isError={!!errors.batch}
              />
              <DropInputbox
                list={typelist}
                name="type"
                register={register("type", { required: "유형을 선택해주세요." })}
                placeholder="유형 *"
                isError={!!errors.type}
              />
            </div>
            <div className={styles.content_body2}>
              <DropInputbox
                list={grouplist}
                name="group"
                register={register("groupname", { required: "그룹을 선택해주세요." })}
                placeholder="그룹 *"
                isError={!!errors.groupname}
              />
              <DropInputbox
                list={turnlist}
                name="turn"
                register={register("turn", { required: "순번을 선택해주세요." })}
                placeholder="순번 *"
                isError={!!errors.turn}
              />
            </div>
          </div>

          <div className={styles.content_body}>
            <div className={styles.content_body2}>
              <Inputbox
                type="date"
                placeholder="가입일자 *"
                register={register("registerdate", { required: "가입일자를 입력해주세요." })}
                isError={!!errors.registerdate}
              />
            </div>
            <div className={styles.content_body2}>
              {/* 수정 부분: 가입가를 천단위 콤마 표시 */}
              <Inputbox
                type="text"
                placeholder="가입가 *"
                value={formattedRegisterPrice}
                onChange={handleRegisterPriceChange}
                isError={!!errors.registerprice}
              />
            </div>
          </div>
          <div className={styles.content_body}>
            <div className={styles.content_body2}>
              <Inputbox
                type="date"
                placeholder="예약금 납입일자 *"
                register={register("Deposit.depositdate", { required: "예약금 납입일자를 입력해주세요." })}
                isError={!!errors.Deposit?.depositdate}
              />
            </div>
            <div className={styles.content_body2}>
              {/* 수정 부분: 예약금을 천단위 콤마 표시 */}
              <Inputbox
                type="text"
                placeholder="예약금 *"
                value={formattedDepositAmmount}
                onChange={handleDepositAmmountChange}
                isError={!!errors.Deposit?.depositammount}
              />
            </div>
          </div>
          <div className={styles.content_body}>
            <div className={styles.content_body3}>
              <Checkbox
                label="7차 면제"
                name="exemption7"
                checked={isupload.exemption7}
                onChange={handleCheckboxChange}
                register={register("exemption7")}
                isError={!!errors.exemption7}
              />
            </div>
            <div className={styles.content_body3}>
              <Checkbox
                label="출자금"
                name="investmentfile"
                checked={isupload.investmentfile}
                onChange={handleCheckboxChange}
                register={register("investmentfile")}
                isError={!!errors.investmentfile}
              />
            </div>
            <div className={styles.content_body3}>
              <Checkbox
                label="지산A동 계약서"
                name="contract"
                checked={isupload.contract}
                onChange={handleCheckboxChange}
                register={register("contract")}
                isError={!!errors.contract}
              />
            </div>
          </div>
        </div>

        <h3>MGM</h3>
        <div className={styles.content_container}>
          <div>
            <Inputbox
              type="text"
              placeholder="업체명 *"
              register={register("MGM.mgmcompanyname", { required: "업체명을 입력해주세요." })}
              isError={!!errors.MGM?.mgmcompanyname}
            />
          </div>
          <div>
            <Inputbox
              type="text"
              placeholder="이름 *"
              register={register("MGM.mgmname", { required: "이름을 입력해주세요." })}
              isError={!!errors.MGM?.mgmname}
            />
          </div>
          <div>
            <Inputbox
              type="text"
              placeholder="기관 *"
              register={register("MGM.mgminstitution", { required: "기관을 입력해주세요." })}
              isError={!!errors.MGM?.mgminstitution}
            />
          </div>
          <div>
            <Inputbox
              type="text"
              placeholder="계좌 *"
              register={register("MGM.mgmaccount", { required: "계좌를 입력해주세요." })}
              isError={!!errors.MGM?.mgmaccount}
            />
          </div>
        </div>

        <h3>부속서류</h3>
        <div className={styles.content_container}>
          <div>
            <Checkbox
              label="인감증명서"
              name="sealcertificateprovided"
              checked={isupload.sealcertificateprovided}
              onChange={handleCheckboxChange}
              register={register("sealcertificateprovided")}
              isError={!!errors.sealcertificateprovided}
            />
          </div>
          <div>
            <Checkbox
              label="본인서명확인서"
              name="selfsignatureconfirmationprovided"
              checked={isupload.selfsignatureconfirmationprovided}
              onChange={handleCheckboxChange}
              register={register("selfsignatureconfirmationprovided")}
              isError={!!errors.selfsignatureconfirmationprovided}
            />
          </div>
          <div>
            <Checkbox
              label="확약서"
              name="commitmentletterprovided"
              checked={isupload.commitmentletterprovided}
              onChange={handleCheckboxChange}
              register={register("commitmentletterprovided")}
              isError={!!errors.commitmentletterprovided}
            />
          </div>
          <div>
            <Checkbox
              label="신분증"
              name="idcopyprovided"
              checked={isupload.idcopyprovided}
              onChange={handleCheckboxChange}
              register={register("idcopyprovided")}
              isError={!!errors.idcopyprovided}
            />
          </div>
          <div>
            <Checkbox
              label="무상옵션"
              name="freeoption"
              checked={isupload.freeoption}
              onChange={handleCheckboxChange}
              register={register("freeoption")}
              isError={!!errors.freeoption}
            />
          </div>
          <div>
            <Checkbox
              label="창준위용"
              name="forfounding"
              checked={isupload.forfounding}
              onChange={handleCheckboxChange}
              register={register("forfounding")}
              isError={!!errors.forfounding}
            />
          </div>
          <div>
            <Checkbox
              label="총회동의서"
              name="agreement"
              checked={isupload.agreement}
              onChange={handleCheckboxChange}
              register={register("agreement")}
              isError={!!errors.agreement}
            />
          </div>
          <div>
            <Checkbox
              label="선호도조사"
              name="preferenceattachment"
              checked={isupload.preferenceattachment}
              onChange={handleCheckboxChange}
              register={register("preferenceattachment")}
              isError={!!errors.preferenceattachment}
            />
          </div>
          <div>
            <Checkbox
              label="사은품"
              name="prizeattachment"
              checked={isupload.prizeattachment}
              onChange={handleCheckboxChange}
              register={register("prizeattachment")}
              isError={!!errors.prizeattachment}
            />
          </div>
          <div></div>
          <div>
            <span>파일업로드</span>
            <FileInputbox
              name="fileupload"
              handleChange={handleFileChange}
              register={register("fileupload")}
              isupload={isupload.isuploaded}
              value={file ? file.name : ""}
              isError={!!errors.fileupload}
            />
            {existingFileInfo && (
              <div className={styles.existingFile}>
                기존 파일: {existingFileInfo}
              </div>
            )}
          </div>
        </div>

        <h3>담당자 정보</h3>
        <div className={styles.content_container}>
          <div>
            <Inputbox
              type="text"
              placeholder="총괄 *"
              register={register("Responsible.generalmanagement", { required: "총괄을 입력해주세요." })}
              isError={!!errors.Responsible?.generalmanagement}
            />
          </div>
          <div>
            <Inputbox
              type="text"
              placeholder="본부 *"
              register={register("Responsible.division", { required: "본부를 입력해주세요." })}
              isError={!!errors.Responsible?.division}
            />
          </div>
          <div>
            <Inputbox
              type="text"
              placeholder="팀 *"
              register={register("Responsible.team", { required: "팀을 입력해주세요." })}
              isError={!!errors.Responsible?.team}
            />
          </div>
          <div>
            <Inputbox
              type="text"
              placeholder="성명 *"
              register={register("Responsible.managername", { required: "성명을 입력해주세요." })}
              isError={!!errors.Responsible?.managername}
            />
          </div>
        </div>

        <h3>기타 정보</h3>
        <div className={styles.content_container}>
          <InputAreabox
            type="text"
            placeholder="기타"
            register={register("specialnote")}
            isError={!!errors.specialnote}
          />
        </div>
        <h1></h1>
        <Button_Y type="submit">수정하기</Button_Y>
        <h1></h1>
      </form>
    </div>
  );
}

export default withAuth(Modify);
