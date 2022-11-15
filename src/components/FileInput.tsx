import React from "react";
import { Custom } from "react-xnft";
import { CSSProperties } from "react";

export interface FileInputProps {
  onChange: (event: Event) => void;
  style?: CSSProperties;
  multiple?: boolean;
};


export const FileInput = ({ onChange, style, multiple }: FileInputProps) => {
  return (
      <Custom
        component={"input"}
        type={"file"}
        style={style}
        onChange={onChange}
        multiple={multiple}
      />
  );
};


