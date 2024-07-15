"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AiFillAppstore } from "react-icons/ai";
import { AiOutlineAppstore } from "react-icons/ai";
import { HiOutlineUsers } from "react-icons/hi2";
import { HiUsers } from "react-icons/hi";
import { AiOutlineDollar } from "react-icons/ai";
import { AiFillDollarCircle } from "react-icons/ai";
import LOGO from "@/img/logo.png";
import styles from "../styles/Nav.module.scss";

const iconstyle = { fontSize: "1.5em", paddingRight: "10%", paddingLeft: "7%" };

const Nav = () => {
  const pathname = usePathname();
  const splitpath = pathname.split('/');

  return (
    <div className={styles.container}>
      <Link href = "/dashboard">
        <Image src={LOGO} className={styles.logostyle} alt={"logo"} />
      </Link>
      <ul className={styles.listconatiner}>
        <Link href="/dashboard">
          <li className={splitpath[1] === "dashboard" ? styles.select : styles.nonselect}>
            <div className={styles.innerconaainer}>
                {splitpath[1] === "dashboard" ? (<AiFillAppstore style={iconstyle} />) : (<AiOutlineAppstore style={iconstyle} />)}
                <span className={styles.innertext}>대시보드</span>
            </div>
          </li>
        </Link>
        <Link href="/search">
          <li className={splitpath[1] === "search" ? styles.select : styles.nonselect}>
            <div className={styles.innerconaainer}>
              {splitpath[1] === "search" ? (<HiUsers style={iconstyle} />) : (<HiOutlineUsers style={iconstyle} />)}
              <span className={styles.innertext}>고객 정보 검색</span>
            </div>
          </li>
        </Link>
        <Link href="/create">
          <li className={splitpath[1] === "create" ? styles.select : styles.nonselect}>
            <div className={styles.innerconaainer}>
              {splitpath[1] === "create" ? (<HiUsers style={iconstyle} />) : (<HiOutlineUsers style={iconstyle} />)}
              <span className={styles.innertext}>고객 정보 입력</span>
            </div>
          </li>
        </Link>
        <Link href="/modify">
          <li className={splitpath[1] === "modify" ? styles.select : styles.nonselect}>
            <div className={styles.innerconaainer}>
              {splitpath[1] === "modify" ? (<HiUsers style={iconstyle} />) : (<HiOutlineUsers style={iconstyle} />)}
              <span className={styles.innertext}>고객 정보 수정</span>
            </div>
          </li>
        </Link>
        <Link href="/inputmoney">
        <li className={splitpath[1] === "inputmoney" ? styles.select : styles.nonselect}>
            <div className={styles.innerconaainer}>
            {splitpath[1] === "inputmoney" ? (<AiFillDollarCircle style={iconstyle} />) : (<AiOutlineDollar style={iconstyle} />)}
                <span className={styles.innertext}>납입금 관리</span>
            </div>
          </li>
        </Link>
        <Link href="/control">
          <li className={splitpath[1] === "control" ? styles.select : styles.nonselect}>
            <div className={styles.innerconaainer}>
                {splitpath[1] === "control" ? (<AiFillDollarCircle style={iconstyle} />) : (<AiOutlineDollar style={iconstyle} />)}
                <span className={styles.innertext}>차수 관리</span>
            </div>
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default Nav;
