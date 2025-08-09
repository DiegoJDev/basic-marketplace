import React from "react";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={joinClassNames(
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
