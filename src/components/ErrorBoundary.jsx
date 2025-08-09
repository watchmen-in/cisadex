import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      // TEMP: show details even in production to debug
      return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>
{String(this.state.error)}
{"\n\n"}
{this.state.info?.componentStack || ""}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
