/* Allow use of a custom <su /> element in TSX (JSX intrinsic elements). */
declare namespace JSX {
  interface IntrinsicElements {
    su: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
