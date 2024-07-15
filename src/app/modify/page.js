"use client";

import {
  Inputbox,
  PostInputbox,
  LongInputbox,
  DropInputbox,
  FileInputbox,
} from "@/components/Inputbox";
import styles from "@/styles/Search.module.scss";
import { searchnameState, searchnumberState } from "@/utils/atom";
import { namesearchSelector } from "@/utils/selector";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useRecoilValue,
  useRecoilValueLoadable,
  useSetRecoilState,
} from "recoil";
import {
  banklist,
  sintacklist,
  typeidlist,
  typelist,
  grouplist,
  turnlist,
} from "@/components/droplistdata";
import { deleteUser } from "@/utils/api";
import { ModifyButton } from "@/components/Button";
import withAuth from "@/utils/hoc/withAuth";

const SearchList = ({ name, number }) => {
  const setNameState = useSetRecoilState(searchnameState);
  const setNumberState = useSetRecoilState(searchnumberState);
  let searchname = name.length > 1 ? name : "";
  let searchnumber = number.length > 1 ? number : "";

  useEffect(() => {
    setNameState(searchname);
    setNumberState(searchnumber);
  }, [searchname, searchnumber, setNameState, setNumberState]);

  let searchdata = useRecoilValueLoadable(namesearchSelector);

  if (searchdata.state === "loading") {
    return null;
  }

  if (searchdata.state === "hasError") {
    return <div> </div>;
  }

  const handleDelete = async (id) => {
    console.log("Deleting user with id:", id); // 이 줄을 추가하여 id 값을 로그로 확인
    try {
      await deleteUser(id);
      alert("사용자가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("사용자 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      {searchdata.state === "hasValue" &&
        searchdata.contents
          .filter((k) => k.userinfo && k.data)
          .map((k) => (
            <div className={styles.maincontainer} key={k.id}>
              <Link href={"/modify/" + k.id} className={styles.link}>
                <div className={styles.rowContainer}>
                  <div className={styles.unitContainer}>{k.id}</div>
                  <div className={styles.unitContainer}>
                    {k.userinfo?.name || "N/A"}
                  </div>
                  <div className={styles.unitContainer}>
                    {k.data?.type || "N/A"}
                  </div>
                  <div className={styles.unitContainer}>
                    {k.data?.group || "N/A"}
                  </div>
                  <div className={styles.unitContainer}>
                    {k.data?.turn || "N/A"}
                  </div>
                  <div
                    className={styles.unitContainer}
                  >{`${k.data?.type || "N/A"}-${k.data?.group || "N/A"}-${k.data?.turn || "N/A"}`}</div>
                </div>
              </Link>
              <ModifyButton onClick={() => handleDelete(k.id)}>
                <div className={styles.CBBottonFont}>삭제</div>
              </ModifyButton>
            </div>
          ))}
    </div>
  );
};

function Modify() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");

  const onNameChange = (e) => {
    const text = e.target.value;
    setName(text.replace(/ /g, ""));
  };

  const onNumberChange = (e) => {
    const text = e.target.value;
    setNumber(text.replace(/ /g, ""));
  };

  return (
    <>
      <h1></h1>
      <div className={styles.flexContainer}>
        <Inputbox type="text" placeholder="고객 성함" onChange={onNameChange} />
        <Inputbox
          type="text"
          placeholder="관리번호"
          onChange={onNumberChange}
        />
        <DropInputbox list={typelist} />
        <DropInputbox list={grouplist} />
        <DropInputbox list={turnlist} />
      </div>
      <div className={styles.tablecontainer}>
        <span>관리번호</span>
        <span>성명</span>
        <span>타입</span>
        <span>군</span>
        <span>순번</span>
        <span>임시동호</span>
      </div>
      {typeof window !== "undefined" && (
        <SearchList name={name} number={number} />
      )}
    </>
  );
}
export default withAuth(Modify);
