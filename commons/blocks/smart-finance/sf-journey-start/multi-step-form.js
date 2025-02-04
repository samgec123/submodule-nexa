/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { render, h, createContext, cloneElement, Fragment } from '../../../scripts/vendor/preact.js';
import { useState, useRef, useEffect } from '../../../scripts/vendor/preact-hooks.js';
import { html } from '../../../scripts/vendor/htm-preact.js';
import { fetchPlaceholders, toClassName } from '../../../scripts/aem.js';

export function hnodeAs(node, tagName, props = {}) {
  const copy = cloneElement(node, props);
  copy.type = tagName;
  return copy;
}

function attributesToString(attrs) {
  return Object.entries(attrs)
    .filter(([key, value]) => key !== 'children' && value != null) // Exclude children and null values
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
}

function getAttributes(element) {
  return Object.fromEntries([...element.attributes].map((attr) => [attr.name, attr.value]));
}

// Function to recursively convert Preact nodes to HTML string
export function renderToString(node) {
  if (node === null || node === undefined) {
    return '';
  }

  if (typeof node === 'string') {
    return node;
  }

  if (node.type === Fragment) {
    return node.props.children.map(renderToString).join('');
  }

  const tagName = node.type.toLowerCase();
  const attributes = attributesToString(node.props);

  const children = node.props.children
    ? node.props.children.map((child) => renderToString(child)).join('')
    : '';

  const attrs = attributes ? ` ${attributes}` : '';
  return `<${tagName}${attrs}>${children}</${tagName}>`;
}

export function htmlStringToPreactNode(htmlString) {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(htmlString, 'text/html');
  function convert(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const children = [...node.childNodes].map(convert);
      return h(node.nodeName.toLowerCase(), getAttributes(node), children);
    }
    return null;
  }
  return convert(doc.body);
}

/**
 * Replaces a placeholder in a Preact node with a given value.
 *
 * @param {JSX.Element} node - The Preact node to be processed.
 * @param {string} parameter - The placeholder parameter to replace, e.g., 'name'.
 * @param {string} toReplaceWith - The value to replace the placeholder with.
 * @returns {JSX.Element} - The updated Preact node with the replacement.
 */
export function replaceAndConvertNode(node, parameter, toReplaceWith) {
  // Convert Preact node to HTML string
  const htmlString = renderToString(node);

  // Create a regex pattern for the placeholder
  const pattern = new RegExp(`{{state\\.${parameter}}}`, 'g');

  // Replace the placeholder with the given value
  const updatedHtmlString = htmlString.replace(pattern, toReplaceWith);

  // Convert updated HTML string back to Preact node
  return htmlStringToPreactNode(updatedHtmlString);
}

function hnode(nodes) {
  const convert = (node) => {
    if (node) {
      if (node.nodeType === 3) {
        return node.data;
      }
      if (node.nodeType === 1) {
        return h(node.nodeName.toLowerCase(), getAttributes(node), [...node.childNodes].map(hnode));
      }
    }
    return null;
  };
  if (nodes instanceof HTMLCollection) {
    // eslint-disable-next-line no-param-reassign
    nodes = [...nodes];
  }
  if (Array.isArray(nodes)) {
    return nodes.filter(Boolean).map(convert).filter(Boolean);
  }

  return convert(nodes);
}

function parseConfig(block, Component) {
  let config = block;
  let attrs = {};
  if (config) {
    attrs = getAttributes(config);
    config = Component.parse(config);
    config = {
      ...Component.defaults,
      ...Object.entries(config)
        // the entries are key => node pairs
        // adapt the nodes to hnodes
        .map(([key, value]) => [key, hnode(value)])
        // filter out any falsy values
        .filter(([, value]) => value)
        // convert the array back to an object
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
    };
  } else {
    config = Component.defaults;
  }

  return { attrs, config };
}

export const MultiStepFormContext = createContext();

export default async function decorate(block, routes) {
  const parsedRoutes = Object.entries(routes).reduce((acc, [name, Component]) => {
    const configBlock = block.querySelector(`.${toClassName(name)}`);
    const parsed = parseConfig(configBlock, Component);
    return { ...acc, [name]: parsed };
  }, {});

  /**
   * A higher level component that wraps the given child into a <div> that is a dynamic-block.
   * The dynamic-block receives updates in the editor from the editor-support script and can
   * parse them to apply them selectively. To do that the block keeps track of the applied
   * configuration and attributes.
   */
  function MultiStepFormStep({ props, children: renderer }) {
    const { config, attrs, name, isActive } = props;
    const [editorState, setEditorState] = useState(null);
    const ref = useRef();
    const classList = [name, 'dynamic-block'];

    if (isActive) classList.push('active');

    useEffect(() => {
      // listen for updates, parse them using the same function used in decorate() and update
      // the state accordingly
      function handleContentUpdate({ detail: update }) {
        const parsedUpdate = new DOMParser().parseFromString(update, 'text/html');
        const configBlock = parsedUpdate.querySelector(`.${name}`);
        const { attrs: newAttrs, config: newConfig } = parseConfig(configBlock, routes[name]);
        setEditorState({ attrs: newAttrs, config: newConfig });
      }
      ref.current.addEventListener('apply-update', handleContentUpdate);
      return () => ref.current.removeEventListener('apply-update', handleContentUpdate);
    }, [name]);

    return html`
        <div ...${editorState ? editorState.attrs : attrs} class="${classList.join(' ')}" ref=${ref}>
          ${renderer({ config: editorState ? editorState.config : config })}
        </div>
      `;
  }

  function MultiStepForm() {
    const [firstRoute] = Object.keys(routes);
    const [activeRoute, setActiveRoute] = useState(firstRoute);
    const [formState, updateFormState] = useState({});
    const [placeholders, setPlaceholders] = useState({});

    const handleSetActiveRoute = (newRoute) => {
      if (newRoute && routes[newRoute] && newRoute !== activeRoute) {
        setActiveRoute(newRoute);
        block.dataset.activeRoute = newRoute;

        // Update the URL without reloading the page
        const url = new URL(window.location);
        url.searchParams.set('step', newRoute);
        window.history.pushState({}, '', url);
      }
    };
    useEffect(async () => {
      setPlaceholders(await fetchPlaceholders(window.hlx.codeBasePath));
    }, []);

    useEffect(() => {
      const urlParams = new URL(window.location).searchParams;
      const step = urlParams.get('step');

      // Check if the URL has a step parameter
      if (step && routes[step]) {
        // If step exists in URL, check the form state
        if (formState.mobileNumber) {
          // If mobile-number is set, load the step directly
          setActiveRoute(step);
        } else {
          // If mobile-number is not set, load the first step
          setActiveRoute(firstRoute);
          const url = new URL(window.location);
          url.searchParams.delete('step');
          window.history.pushState({}, '', url);
        }
      } else {
        // If no step in URL, load the first step
        setActiveRoute(firstRoute);
      }

      // Cleanup function if needed
      return () => { };
    }, [firstRoute, formState]);

    // eslint-disable-next-line no-use-before-define,max-len
    const context = { activeRoute, setActiveRoute, formState, updateFormState, handleSetActiveRoute, placeholders };

    // if loaded in an iframe (Universal Editor), render all routes
    block.dataset.renderAll = window.self !== window.top ? 'true' : '';
    block.dataset.activeRoute = activeRoute;

    // listen for navigation triggered from the outside, e.g. the Universal Editor
    block.addEventListener('navigate-to-route', ({ detail }) => {
      const { route: newRoute } = detail;
      if (newRoute && routes[newRoute] && newRoute !== activeRoute) {
        handleSetActiveRoute(newRoute);
        block.dataset.activeRoute = newRoute;
      }
    });

    useEffect(() => {
    }, [formState]);

    useEffect(() => {
      // eslint-disable-next-line no-unused-vars
      function handlePopState(event) {
        const urlParams = new URL(window.location).searchParams;
        const step = urlParams.get('step');
        if (step && routes[step]) {
          setActiveRoute(step);
        } else {
          setActiveRoute(firstRoute);
        }
      }

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }, []);

    let formContent;
    if (block.dataset.renderAll === 'true') {
      // for authoring we have to render all the routes and show/hide them with CSS
      formContent = Object.entries(routes).map(([name, Component]) => {
        const { attrs, config } = parsedRoutes[name];
        return html`
            <${MultiStepFormStep} props=${{ config, attrs, name, isActive: name === activeRoute }}>
              ${(props) => html`<${Component} ...${props}/>`}
            </${MultiStepFormStep}>
          `;
      });
    } else {
      // otherwise we only render the active route
      const Component = routes[activeRoute];
      const { attrs, config } = parsedRoutes[activeRoute];
      formContent = html`
          <${MultiStepFormStep} props=${{ config, attrs, name: activeRoute, isActive: true }}>
            ${(props) => html`<${Component} ...${props}/>`}
          </${MultiStepFormStep}>
        `;
    }

    return html`
        <${MultiStepFormContext.Provider} value=${context}>
          ${formContent}
        </${MultiStepFormContext.Provider}>
      `;
  }

  block.textContent = '';
  render(html`<${MultiStepForm}/>`, block);
}
