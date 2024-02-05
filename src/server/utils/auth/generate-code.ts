import { randomNum } from "~/utils/generate-random-num";

export const generateAuthCode = () => {
  const codeLen = 6;
  const nums = "0123456789".split("").map((str) => parseInt(str));

  let codeStr = "";
  for (let i = 0; i < codeLen; i++) {
    const randomIdx = randomNum(0, nums.length - 1);

    codeStr += nums[randomIdx];
  }

  return {
    codeStr,
    splitCode: codeStr.split(""),
  };
};
