"use client";
import Mininav from "@/components/Mininav";
import styles from "@/styles/Userinfo.module.scss";
import { usePathname } from "next/navigation";
import { useRecoilValueLoadable, useSetRecoilState } from "recoil";
import { userinfoSelector } from "@/utils/selector";
import { useState } from "react";
import { useridState } from "@/utils/atom";
import { DownloadButton, Button } from "@/components/Button";
import Link from "next/link";
import { InputAreabox } from "@/components/Inputbox";
import withAuth from "@/utils/hoc/withAuth";

function Search() {
  const pathname = usePathname();
  const splitpath = pathname.split("/"); //splitpath[3]
  const userid = splitpath[3];
  const setIdState = useSetRecoilState(useridState);
  useState(() => {
    setIdState(userid);
  });
  const userselectordata = useRecoilValueLoadable(userinfoSelector);

  switch (userselectordata.state) {
    case "hasValue":
      const userdata = userselectordata.contents;
      console.log(userdata);
      if (userdata === undefined)
        return (
          <>
            <h1>잘못된 접근입니다</h1>
          </>
        );
      else
        return (
          <>
            <h3>고객정보</h3>
            <div className={styles.container}>
              <span className={styles.title}>관리번호</span>
              <span className={styles.title}>성명</span>
              <span className={styles.title}>주민번호</span>
              <span className={styles.title}>이메일</span>

              <span>{userdata.id}</span>
              <span>{userdata.userinfo.name}</span>
              <span>
                {userdata.userinfo.firstid}-{userdata.userinfo.secondid}
              </span>
              <span>{userdata.userinfo.email}</span>

              <span className={styles.title}>휴대전화</span>
              <span className={styles.title}>타입</span>
              <span className={styles.title}>군</span>
              <span className={styles.title}>순번</span>

              <span>{userdata.userinfo.phone}</span>
              <span>{userdata.data.type}</span>
              <span>{userdata.data.group}</span>
              <span>{userdata.data.turn}</span>

              <span className={styles.title}>가입차순</span>
              <span className={styles.title}>신탁사제출</span>
              <span className={styles.title}>가입일자</span>
              <span className={styles.title}>가입가</span>

              <span>{userdata.data.submitturn}</span>
              <span>없음</span>
              <span>{userdata.data.submitdate.slice(0, 10)}</span>
              <span>
                {userdata.data.submitprice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>

              <span className={styles.title}>우편번호</span>
              <span className={styles.title}>주소지</span>
              <span className={styles.title}></span>
              <span className={styles.title}></span>

              <span>{userdata.userinfo.postnumber}</span>
              <span>{userdata.userinfo.getpost}</span>
              <span></span>
              <span></span>

              <span className={styles.title}>은행명</span>
              <span className={styles.title}>계좌번호</span>
              <span className={styles.title}>예금주</span>
              <span className={styles.title}>신탁사</span>

              <span>{userdata.userinfo.bank}</span>
              <span>{userdata.userinfo.bankid}</span>
              <span>{userdata.userinfo.bankwho}</span>
              <span>{userdata.userinfo.bankwhere}</span>

              <span className={styles.title}>총괄</span>
              <span className={styles.title}>본부</span>
              <span className={styles.title}>팀</span>
              <span className={styles.title}>담당자</span>

              <span>{userdata.ext.manage}</span>
              <span>{userdata.ext.managemain}</span>
              <span>{userdata.ext.manageteam}</span>
              <span>{userdata.ext.managename}</span>
            </div>
            <h1></h1>
            <hr />
            <h3>부속서류</h3>
            <div className={styles.file_container}>
              {JSON.parse(userdata.fileinfo.A) ? (
                <DownloadButton userid={userid} filename="A">
                  인감증명서
                </DownloadButton>
              ) : (
                <>
                  <p>인감증명서</p>
                  <p>파일이 없습니다.</p>
                </>
              )}
              {JSON.parse(userdata.fileinfo.B) ? (
                <DownloadButton userid={userid} filename="B">
                  본인서명확인서
                </DownloadButton>
              ) : (
                <>
                  <p>본인서명확인서</p>
                  <p>파일이 없습니다.</p>
                </>
              )}
              {JSON.parse(userdata.fileinfo.C) ? (
                <DownloadButton userid={userid} filename="C">
                  신분증
                </DownloadButton>
              ) : (
                <>
                  <p>신분증</p>
                  <p>파일이 없습니다.</p>
                </>
              )}
              {JSON.parse(userdata.fileinfo.D) ? (
                <DownloadButton userid={userid} filename="D">
                  확약서
                </DownloadButton>
              ) : (
                <>
                  <p>확약서</p>
                  <p>파일이 없습니다.</p>
                </>
              )}
              {JSON.parse(userdata.fileinfo.E) ? (
                <DownloadButton userid={userid} filename="E">
                  상준위용
                </DownloadButton>
              ) : (
                <>
                  <p>상준위용</p>
                  <p>파일이 없습니다.</p>
                </>
              )}
              {JSON.parse(userdata.fileinfo.F) ? (
                <DownloadButton userid={userid} filename="F">
                  무상옵션
                </DownloadButton>
              ) : (
                <>
                  <p>무상옵션</p>
                  <p>파일이 없습니다.</p>
                </>
              )}
              {JSON.parse(userdata.fileinfo.G) ? (
                <DownloadButton userid={userid} filename="G">
                  선호도조사
                </DownloadButton>
              ) : (
                <>
                  <p>선호도조사</p>
                  <p>파일이 없습니다.</p>
                </>
              )}
              {JSON.parse(userdata.fileinfo.H) ? (
                <DownloadButton userid={userid} filename="H">
                  총회동의서
                </DownloadButton>
              ) : (
                <>
                  <p>총회동의서</p>
                  <p>파일이 없습니다.</p>
                </>
              )}
              {JSON.parse(userdata.fileinfo.I) ? (
                <DownloadButton userid={userid} filename="I">
                  사은품
                </DownloadButton>
              ) : (
                <>
                  <p>사은품</p>
                  <p>파일이 없습니다.</p>
                </>
              )}
            </div>
            <hr />
            <h3>납입금 관리</h3>
            <div className={styles.linkbutton}>
              <Link href={"/inputmoney/userinfo/" + splitpath[3]}>
                <Button>
                  <h3>바로가기</h3>
                </Button>
              </Link>
            </div>
            <hr />
            <h3>기타 정보</h3>
            <div>
              <InputAreabox value={userdata.ext.ext} />
            </div>
          </>
        );

    case "loading":
      console.log("lodding");
      return <></>;

    case "hasError":
      throw userselectordata.contents;
  }
}

export default withAuth(Search);
