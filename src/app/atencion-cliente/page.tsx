"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import AppLayout from "@/components/layout/AppLayout";
import TicketAssignDialog from "@/components/tickets/TicketAssignDialog";
import TicketChangeStatusDialog from "@/components/tickets/TicketChangeStatusDialog";
import TicketCloseDialog from "@/components/tickets/TicketCloseDialog";
import TicketCreateDialog from "@/components/tickets/TicketCreateDialog";
import TicketDeleteDialog from "@/components/tickets/TicketDeleteDialog";
import TicketDetailDialog from "@/components/tickets/TicketDetailDialog";
import TicketEditDialog from "@/components/tickets/TicketEditDialog";
import TicketReassignDialog from "@/components/tickets/TicketReassignDialog";
import TicketsGrid from "@/components/tickets/TicketsGrid";
import TicketKanbanBoard from "@/components/tickets/TicketKanbanBoard";
import TicketFilterBar, {
    emptyFilters,
    type TicketFilters,
} from "@/components/tickets/TicketFilterBar";
import {
    assignTicket,
    changeTicketStatus,
    closeTicket,
    createTicket,
    deleteTicket,
    fetchTicketsFiltered,
    reassignTicket,
    updateTicket,
} from "@/lib/api/ticket";
import apiClient from "@/lib/apiClient";
import { fetchUsuarios, type Usuario } from "@/lib/api/usuarios";
import {
    PrioridadTicket,
    emptyTicketCreateForm,
    ticketEditFormFromTicket,
    type AssignTicketPayload,
    type CloseTicketPayload,
    type ReassignTicketPayload,
    type StoreTicketPayload,
    type Ticket,
    type TicketAssignFormState,
    type TicketClienteResumen,
    type TicketCloseFormState,
    type TicketCreateFormState,
    type TicketEditFormState,
    type TicketReassignFormState,
    type TicketStatusFormState,
    type UpdateTicketPayload,
} from "@/lib/types/ticket";
import {
    Alert,
    Box,
    Button,
    Snackbar,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import TableRowsIcon from "@mui/icons-material/TableRows";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
    CANAL_ORIGEN_DEFAULT,
    ESTADO_TICKET_ABIERTO_VALOR,
    ESTADO_TICKET_ASIGNADO_VALOR,
    TIPO_TICKET_OPCIONES,
} from "@/lib/ticketCatalog";

const PAGE_SIZE = 15;

type ViewMode = "kanban" | "table";

function AtencionClienteContent() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRows, setTotalRows] = useState(0);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: PAGE_SIZE,
        page: 0,
    });

    const [viewMode, setViewMode] = useState<ViewMode>("kanban");
    const [filters, setFilters] = useState<TicketFilters>(emptyFilters);

    const [clientes, setClientes] = useState<TicketClienteResumen[]>([]);
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);

    const [selected, setSelected] = useState<Ticket | null>(null);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openAssign, setOpenAssign] = useState(false);
    const [openReassign, setOpenReassign] = useState(false);
    const [openChangeStatus, setOpenChangeStatus] = useState(false);
    const [openClose, setOpenClose] = useState(false);

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState({
        open: false,
        texto: "",
        color: "success" as "success" | "error",
    });

    const showMsg = (texto: string, color: "success" | "error") =>
        setMensaje({ open: true, texto, color });

    const [createForm, setCreateForm] = useState<TicketCreateFormState>(emptyTicketCreateForm);
    const [editForm, setEditForm] = useState<TicketEditFormState>(() => ({
        id_tipo_ticket: TIPO_TICKET_OPCIONES[0]?.value ?? "consulta",
        id_prioridad: PrioridadTicket.Media,
        id_estado_ticket: ESTADO_TICKET_ABIERTO_VALOR,
        asunto: "",
        descripcion: "",
        canal_origen: CANAL_ORIGEN_DEFAULT,
        observaciones_generales: "",
    }));
    const [assignForm, setAssignForm] = useState<TicketAssignFormState>({ id_usuario: null, motivo: "" });
    const [reassignForm, setReassignForm] = useState<TicketReassignFormState>({
        id_usuario: null,
        motivo: "",
    });
    const [statusForm, setStatusForm] = useState<TicketStatusFormState>(() => ({
        id_estado_ticket: ESTADO_TICKET_ABIERTO_VALOR,
        descripcion: "",
        id_usuario_asignado: null,
        motivo_asignacion: "",
    }));
    const [closeForm, setCloseForm] = useState<TicketCloseFormState>({ descripcion: "" });

    const loadClientes = useCallback(async () => {
        setLoadingClientes(true);
        try {
            const res = await apiClient.get("/clientes/all");
            const list = (res.data?.data ?? []) as TicketClienteResumen[];
            setClientes(Array.isArray(list) ? list : []);
        } catch {
            showMsg("Error al cargar clientes", "error");
        } finally {
            setLoadingClientes(false);
        }
    }, []);

    const loadUsuarios = useCallback(async () => {
        setLoadingUsuarios(true);
        try {
            let pageNum = 1;
            const acc: Usuario[] = [];
            let lastPage = 1;
            do {
                const r = await fetchUsuarios(pageNum);
                acc.push(...r.data.filter((u) => u.estado));
                lastPage = r.meta.last_page;
                pageNum += 1;
            } while (pageNum <= lastPage);
            setUsuarios(acc);
        } catch {
            showMsg("Error al cargar usuarios", "error");
        } finally {
            setLoadingUsuarios(false);
        }
    }, []);

    const loadTickets = useCallback(
        async (page: number) => {
            setLoading(true);
            try {
                const params: Record<string, unknown> = {
                    page: page + 1,
                    per_page: viewMode === "kanban" ? 100 : PAGE_SIZE,
                };
                if (filters.id_estado_ticket) params.id_estado_ticket = filters.id_estado_ticket;
                if (filters.canal_origen) params.canal_origen = filters.canal_origen;
                if (filters.id_cliente) params.id_cliente = filters.id_cliente;
                if (filters.id_tipo_ticket) params.id_tipo_ticket = filters.id_tipo_ticket;
                if (filters.id_prioridad) params.id_prioridad = Number(filters.id_prioridad);
                if (filters.search) params.search = filters.search;

                const result = await fetchTicketsFiltered(params);
                setTickets(result.data);
                setTotalRows(result.meta.total);
            } catch {
                showMsg("Error al cargar tickets", "error");
            } finally {
                setLoading(false);
            }
        },
        [viewMode, filters]
    );

    useEffect(() => {
        loadTickets(paginationModel.page);
    }, [paginationModel.page, loadTickets]);

    useEffect(() => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, [filters]);

    useEffect(() => {
        loadClientes();
    }, [loadClientes]);

    const openCreateModal = () => {
        setCreateForm(emptyTicketCreateForm());
        setFormError(null);
        setOpenCreate(true);
    };

    const openDetailModal = (t: Ticket) => {
        setSelected(t);
        setOpenDetail(true);
    };

    const openEditModal = (t: Ticket) => {
        setSelected(t);
        setEditForm(ticketEditFormFromTicket(t));
        setFormError(null);
        setOpenEdit(true);
    };

    const openAssignModal = (t: Ticket) => {
        setSelected(t);
        setAssignForm({ id_usuario: null, motivo: "" });
        setFormError(null);
        if (usuarios.length === 0) void loadUsuarios();
        setOpenAssign(true);
    };

    const openReassignModal = (t: Ticket) => {
        setSelected(t);
        setReassignForm({ id_usuario: null, motivo: "" });
        setFormError(null);
        if (usuarios.length === 0) void loadUsuarios();
        setOpenReassign(true);
    };

    const openChangeStatusModal = (t: Ticket) => {
        setSelected(t);
        setStatusForm({
            id_estado_ticket: t.id_estado_ticket,
            descripcion: "",
            id_usuario_asignado: null,
            motivo_asignacion: "",
        });
        setFormError(null);
        if (usuarios.length === 0) void loadUsuarios();
        setOpenChangeStatus(true);
    };

    const openCloseModal = (t: Ticket) => {
        setSelected(t);
        setCloseForm({ descripcion: "" });
        setFormError(null);
        setOpenClose(true);
    };

    const handleCreate = async () => {
        if (!createForm.id_cliente) {
            setFormError("Selecciona un cliente.");
            return;
        }
        if (!createForm.asunto.trim()) {
            setFormError("El asunto es obligatorio.");
            return;
        }
        setSaving(true);
        setFormError(null);
        const desc = createForm.descripcion.trim();
        const obs = createForm.observaciones_generales.trim();
        const payload: Record<string, unknown> = {
            id_cliente: createForm.id_cliente,
            id_tipo_ticket: createForm.id_tipo_ticket,
            id_prioridad: createForm.id_prioridad,
            asunto: createForm.asunto.trim(),
            canal_origen: createForm.canal_origen,
        };
        if (desc) payload.descripcion = desc;
        if (obs) payload.observaciones_generales = obs;
        try {
            await createTicket(payload as unknown as StoreTicketPayload);
            setOpenCreate(false);
            showMsg("Ticket creado correctamente", "success");
            loadTickets(paginationModel.page);
        } catch (error: unknown) {
            setFormError(getApiErrorMessage(error, "No se pudo crear el ticket."));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async () => {
        if (!selected) return;
        setSaving(true);
        setFormError(null);
        const desc = editForm.descripcion.trim();
        const canal = editForm.canal_origen.trim();
        const obs = editForm.observaciones_generales.trim();
        const payload: UpdateTicketPayload = {
            id_tipo_ticket: editForm.id_tipo_ticket,
            id_prioridad: editForm.id_prioridad,
            id_estado_ticket: editForm.id_estado_ticket,
            asunto: editForm.asunto.trim(),
            ...(desc ? { descripcion: desc } : {}),
            ...(canal ? { canal_origen: canal } : {}),
            ...(obs ? { observaciones_generales: obs } : {}),
        };
        try {
            await updateTicket(selected.id_ticket, payload);
            setOpenEdit(false);
            showMsg("Ticket actualizado", "success");
            loadTickets(paginationModel.page);
            setSelected(null);
        } catch (error: unknown) {
            setFormError(getApiErrorMessage(error, "Error al actualizar."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await deleteTicket(selected.id_ticket);
            setOpenDelete(false);
            setOpenDetail(false);
            showMsg("Ticket eliminado", "success");
            loadTickets(paginationModel.page);
            setSelected(null);
        } catch {
            showMsg("No se pudo eliminar el ticket", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleAssign = async () => {
        if (!selected || !assignForm.id_usuario) {
            setFormError("Selecciona un usuario.");
            return;
        }
        setSaving(true);
        setFormError(null);
        const payload: AssignTicketPayload = {
            id_usuario_asignado: assignForm.id_usuario,
            motivo_asignacion: assignForm.motivo.trim() || null,
        };
        try {
            await assignTicket(selected.id_ticket, payload);
            setOpenAssign(false);
            showMsg("Ticket asignado", "success");
            loadTickets(paginationModel.page);
        } catch (error: unknown) {
            setFormError(getApiErrorMessage(error, "No se pudo asignar."));
        } finally {
            setSaving(false);
        }
    };

    const handleReassign = async () => {
        if (!selected || !reassignForm.id_usuario) {
            setFormError("Selecciona un usuario.");
            return;
        }
        if (!reassignForm.motivo.trim()) {
            setFormError("El motivo de reasignacion es obligatorio.");
            return;
        }
        setSaving(true);
        setFormError(null);
        const payload: ReassignTicketPayload = {
            id_usuario_asignado: reassignForm.id_usuario,
            motivo_asignacion: reassignForm.motivo.trim(),
        };
        try {
            await reassignTicket(selected.id_ticket, payload);
            setOpenReassign(false);
            showMsg("Ticket reasignado", "success");
            loadTickets(paginationModel.page);
        } catch (error: unknown) {
            setFormError(getApiErrorMessage(error, "No se pudo reasignar."));
        } finally {
            setSaving(false);
        }
    };

    const handleChangeStatus = async () => {
        if (!selected) return;
        const desc = statusForm.descripcion.trim();
        if (!desc) {
            setFormError("Describe el cambio de estado.");
            return;
        }

        const esAsignacion = statusForm.id_estado_ticket === ESTADO_TICKET_ASIGNADO_VALOR;
        if (esAsignacion && !statusForm.id_usuario_asignado) {
            setFormError("Selecciona un usuario para asignar el ticket.");
            return;
        }

        setSaving(true);
        setFormError(null);
        try {
            if (esAsignacion && statusForm.id_usuario_asignado) {
                await assignTicket(selected.id_ticket, {
                    id_usuario_asignado: statusForm.id_usuario_asignado,
                    motivo_asignacion: statusForm.motivo_asignacion.trim() || desc,
                });
            } else {
                await changeTicketStatus(selected.id_ticket, {
                    id_estado_ticket: statusForm.id_estado_ticket,
                    descripcion: desc,
                });
            }
            setOpenChangeStatus(false);
            showMsg("Estado actualizado", "success");
            loadTickets(paginationModel.page);
        } catch (error: unknown) {
            setFormError(getApiErrorMessage(error, "No se pudo cambiar el estado."));
        } finally {
            setSaving(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!selected) return;
        setSaving(true);
        setFormError(null);
        const payload: CloseTicketPayload = {
            descripcion: closeForm.descripcion.trim() || null,
        };
        try {
            await closeTicket(selected.id_ticket, payload);
            setOpenClose(false);
            setOpenDetail(false);
            showMsg("Ticket cerrado", "success");
            loadTickets(paginationModel.page);
            setSelected(null);
        } catch (error: unknown) {
            setFormError(getApiErrorMessage(error, "No se pudo cerrar."));
        } finally {
            setSaving(false);
        }
    };

    const handleKanbanChangeStatus = useCallback(
        async (ticketId: number, nuevoEstado: string) => {
            const ticket = tickets.find((t) => t.id_ticket === ticketId);
            if (!ticket) return;

            setSelected(ticket);
            setStatusForm({
                id_estado_ticket: nuevoEstado,
                descripcion: "",
                id_usuario_asignado: null,
                motivo_asignacion: "",
            });
            setFormError(null);
            if (usuarios.length === 0) void loadUsuarios();
            setOpenChangeStatus(true);
        },
        [tickets, usuarios.length, loadUsuarios]
    );

    return (
        <>
            <Box
                sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SupportAgentIcon color="primary" />
                    <Typography variant="h5" fontWeight="bold">
                        Atencion al cliente
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_e, v) => v && setViewMode(v)}
                        size="small"
                    >
                        <ToggleButton value="kanban">
                            <ViewColumnIcon sx={{ mr: 0.5 }} fontSize="small" />
                            Kanban
                        </ToggleButton>
                        <ToggleButton value="table">
                            <TableRowsIcon sx={{ mr: 0.5 }} fontSize="small" />
                            Tabla
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
                        Nuevo ticket
                    </Button>
                </Box>
            </Box>

            <TicketFilterBar
                filters={filters}
                onFilterChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
                onClear={() => setFilters(emptyFilters)}
                clientes={clientes}
                loadingClientes={loadingClientes}
            />

            {viewMode === "kanban" ? (
                <TicketKanbanBoard
                    tickets={tickets}
                    onOpenDetail={openDetailModal}
                    onOpenEdit={openEditModal}
                    onChangeStatus={handleKanbanChangeStatus}
                />
            ) : (
                <TicketsGrid
                    tickets={tickets}
                    loading={loading}
                    totalRows={totalRows}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    onOpenDetail={openDetailModal}
                    onOpenEdit={openEditModal}
                    pageSize={PAGE_SIZE}
                />
            )}

            <TicketCreateDialog
                open={openCreate}
                onClose={() => {
                    setFormError(null);
                    setOpenCreate(false);
                }}
                form={createForm}
                onFormChange={(patch) => setCreateForm((prev) => ({ ...prev, ...patch }))}
                clientes={clientes}
                loadingClientes={loadingClientes}
                formError={formError}
                saving={saving}
                onSubmit={handleCreate}
            />

            <TicketEditDialog
                open={openEdit}
                codigoTicket={selected?.codigo_ticket}
                onClose={() => {
                    setFormError(null);
                    setOpenEdit(false);
                }}
                form={editForm}
                onFormChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
                formError={formError}
                saving={saving}
                onSubmit={handleEdit}
            />

            <TicketDetailDialog
                open={openDetail}
                ticket={selected}
                onClose={() => {
                    setOpenDetail(false);
                    setSelected(null);
                }}
                onAssign={openAssignModal}
                onReassign={openReassignModal}
                onChangeStatus={openChangeStatusModal}
                onCloseTicket={openCloseModal}
                onEdit={openEditModal}
                onDelete={(t) => {
                    setSelected(t);
                    setOpenDelete(true);
                }}
            />

            <TicketAssignDialog
                open={openAssign}
                onClose={() => {
                    setFormError(null);
                    setOpenAssign(false);
                }}
                form={assignForm}
                onFormChange={(patch) => setAssignForm((prev) => ({ ...prev, ...patch }))}
                usuarios={usuarios}
                loadingUsuarios={loadingUsuarios}
                formError={formError}
                saving={saving}
                onSubmit={handleAssign}
            />

            <TicketReassignDialog
                open={openReassign}
                onClose={() => {
                    setFormError(null);
                    setOpenReassign(false);
                }}
                form={reassignForm}
                onFormChange={(patch) => setReassignForm((prev) => ({ ...prev, ...patch }))}
                usuarios={usuarios}
                loadingUsuarios={loadingUsuarios}
                formError={formError}
                saving={saving}
                onSubmit={handleReassign}
            />

            <TicketChangeStatusDialog
                open={openChangeStatus}
                onClose={() => {
                    setFormError(null);
                    setOpenChangeStatus(false);
                }}
                ticket={selected}
                form={statusForm}
                onFormChange={(patch) => setStatusForm((prev) => ({ ...prev, ...patch }))}
                usuarios={usuarios}
                loadingUsuarios={loadingUsuarios}
                formError={formError}
                saving={saving}
                onSubmit={handleChangeStatus}
            />

            <TicketCloseDialog
                open={openClose}
                onClose={() => {
                    setFormError(null);
                    setOpenClose(false);
                }}
                form={closeForm}
                onFormChange={(patch) => setCloseForm((prev) => ({ ...prev, ...patch }))}
                formError={formError}
                saving={saving}
                onSubmit={handleCloseTicket}
            />

            <TicketDeleteDialog
                open={openDelete}
                codigoTicket={selected?.codigo_ticket}
                onClose={() => setOpenDelete(false)}
                saving={saving}
                onConfirm={handleDelete}
            />

            <Snackbar
                open={mensaje.open}
                autoHideDuration={4000}
                onClose={() => setMensaje((m) => ({ ...m, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity={mensaje.color} variant="filled" sx={{ width: "100%" }}>
                    {mensaje.texto}
                </Alert>
            </Snackbar>
        </>
    );
}

export default function AtencionClientePage() {
    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
    if (!isClient) return null;
    return (
        <AppLayout>
            <AtencionClienteContent />
        </AppLayout>
    );
}
