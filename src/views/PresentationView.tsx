import {
	Show,
	Suspense,
	createEffect,
	createResource,
	on,
	useContext,
} from "solid-js";
import "../styles.css";
import { SlidevStoreContext } from "./SlidevStoreContext";
import { useApp } from "./useApp";
import { useSettings } from "./useSettings";

const localhost = () => "localhost"; //`127.0.0.1`;

async function fetchIsServerUp(serverAddr: string): Promise<boolean> {
	try {
		const response = await fetch(`${serverAddr}index.html`);
		try {
			await response.text();
			return true;
		} catch {
			return false;
		}
	} catch {
		return false;
	}
}

export const PresentationView = () => {
	const { vault } = useApp();
	const config = useSettings();
	const store = useContext(SlidevStoreContext);

	const serverAddr = () => `http://${localhost()}:${config.port}/`;

	const [isServerUp, { refetch }] = createResource(
		serverAddr,
		fetchIsServerUp,
	);

	createEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		store.currentSlideNumber;
		void refetch();
	});

	const url = () => {
		return `${serverAddr()}${store.currentSlideNumber}?embedded=true`;
	};

	return (
		<Suspense fallback={<div class="flex flex-col h-full">Loading</div>}>
			<Show
				when={isServerUp()}
				fallback={
					<div class="flex flex-col h-full">Server is down</div>
				}
			>
				<div class="flex flex-col h-full">
					<h4>
						{vault.getName()} #{store.currentSlideNumber}
					</h4>
					{/* eslint-disable-next-line react/iframe-missing-sandbox */}
					<iframe
						sandbox="allow-scripts allow-same-origin"
						title="Slidev presentation"
						class="h-full w-full"
						id="iframe"
						src={url()}
					/>
				</div>
			</Show>
		</Suspense>
	);
};
